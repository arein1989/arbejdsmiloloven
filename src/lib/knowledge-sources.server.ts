import { load } from "cheerio";
import type { StreamTextTransform, ToolSet } from "ai";
import { validateAnswer, type VerifiedLaw } from "./law-verification.server";

export type KnowledgeSource = {
  source: "AT" | "NFA" | "BFA";
  url: string;
  title: string;
  text: string;
};
export const NO_KNOWLEDGE =
  "Der blev ikke fundet en specifik artikel om emnet på AT, NFA eller BFA.";

export function knowledgeUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
    if (
      ![
        "at.dk",
        "www.at.dk",
        "nfa.dk",
        "www.nfa.dk",
        "godtarbejdsmiljo.dk",
        "www.godtarbejdsmiljo.dk",
      ].includes(url.hostname)
    )
      return null;
    if (url.pathname === "/" || /\/(?:soeg|soegeresultat|search)\/?$/i.test(url.pathname))
      return null;
    url.hash = "";
    return url.href;
  } catch {
    return null;
  }
}

// Validate every redirect before fetching it: article discovery never grants arbitrary network access.
async function fetchOfficial(
  url: string,
  signal?: AbortSignal,
): Promise<{ url: string; html: string } | null> {
  for (let i = 0; i < 4; i++) {
    const parsed = new URL(url);
    if (
      parsed.protocol !== "https:" ||
      parsed.username ||
      parsed.password ||
      parsed.port ||
      ![
        "at.dk",
        "www.at.dk",
        "nfa.dk",
        "www.nfa.dk",
        "godtarbejdsmiljo.dk",
        "www.godtarbejdsmiljo.dk",
      ].includes(parsed.hostname)
    )
      return null;
    const response = await fetch(url, {
      signal,
      redirect: "manual",
      headers: { Accept: "text/html" },
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return null;
      url = new URL(location, url).href;
      continue;
    }
    if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return null;
    return { url, html: await response.text() };
  }
  return null;
}

export function parseArticle(html: string, url: string): KnowledgeSource | null {
  const canonical = knowledgeUrl(url);
  if (!canonical) return null;
  const $ = load(html);
  $("script,style,nav,header,footer,aside,form,[role=navigation]").remove();
  const title = $("h1").first().text().replace(/\s+/g, " ").trim();
  const body = $("main").first().length ? $("main").first() : $("article").first();
  const legalLinks = body
    .find('a[href*="retsinformation.dk/eli/"]')
    .map((_i, el) => $(el).attr("href"))
    .get();
  const paragraphs = body.find("p, li").map((_i, el) => $(el).text().replace(/\s+/g, " ").trim()).get().filter(text => text.length >= 40);
  const text = (
    (paragraphs.length ? paragraphs.join(" ") : body.text()).replace(/\s+/g, " ").trim().slice(0, 18000) +
    "\n" +
    legalLinks.join("\n")
  ).trim();
  if (!title || text.length < 200) return null;
  return {
    url: canonical,
    title,
    text,
    source: new URL(canonical).hostname.includes("nfa.dk")
      ? "NFA"
      : new URL(canonical).hostname.includes("at.dk")
        ? "AT"
        : "BFA",
  };
}

function searchTerms(question: string) {
  const topics = question
    .toLowerCase()
    .match(
      /stress|mobning|trivsel|arbejdsulykker|tunge løft|skærmarbejde|kemi|støj|ergonomi|hviletid|psykisk arbejdsmiljø/g,
    );
  if (topics?.length) return [...new Set(topics)].slice(-2).join(" ");
  const stop = new Set(
    "hvad hvordan hvilke hvilken bliver skal kan vil jeg vi vores med om den det der fra til og for er en et på også mere gerne find fortæl siger anbefaler arbejdspladsen arbejdsmiljø".split(
      " ",
    ),
  );
  return (
    [
      ...new Set(
        (question.toLowerCase().match(/[a-zæøå]{3,}/g) ?? []).filter((word) => !stop.has(word)),
      ),
    ]
      .slice(-8)
      .join(" ") || "arbejdsmiljø"
  );
}

export async function collectKnowledge(question: string, signal?: AbortSignal) {
  const query = searchTerms(question);
  let failed = false;
  const candidates = new Set<string>();
  for (const value of question.match(/https:\/\/[^\s)]+/g) ?? []) {
    const url = knowledgeUrl(value);
    if (url) candidates.add(url);
  }
  await Promise.all([
    ...["https://at.ankiro.dk/Rest/at.dk", "https://bm.ankiro.dk/Rest/nfa.dk"].map(
      async (endpoint) => {
        try {
          const res = await fetch(
            `${endpoint}/Search.json?q=${encodeURIComponent(query)}&maxResults=4&resultDetail=All`,
            { signal, redirect: "error" },
          );
          if (!res.ok) {
            failed = true;
            return;
          }
          const data = (await res.json()) as {
            Documents?: Array<{ Properties?: Array<{ Name: string; Value: string }> }>;
          };
          for (const doc of data.Documents ?? []) {
            const url = knowledgeUrl(doc.Properties?.find((p) => p.Name === "Uri")?.Value ?? "");
            if (url) candidates.add(url);
          }
        } catch {
          if (signal?.aborted) throw new Error("Request aborted");
          failed = true;
        }
      },
    ),
    ...["https://www.godtarbejdsmiljo.dk/soegeresultat?q="].map(async (base) => {
      try {
        const result = await fetchOfficial(base + encodeURIComponent(query), signal);
        if (!result) {
          failed = true;
          return;
        }
        const $ = load(result.html);
        const selector = "a.search-result";
        $(selector)
          .slice(0, 5)
          .each((_i, el) => {
            const href = $(el).attr("href");
            if (!href) return;
            const url = knowledgeUrl(new URL(href, result.url).href);
            if (url) candidates.add(url);
          });
      } catch {
        if (signal?.aborted) throw new Error("Request aborted");
        failed = true;
      }
    }),
  ]);
  const sources = (
    await Promise.all(
      [...candidates].slice(0, 12).map(async (url) => {
        try {
          const result = await fetchOfficial(url, signal);
          if (!result) { failed = true; return null; }
          return parseArticle(result.html, result.url);
        } catch {
          if (signal?.aborted) throw new Error("Request aborted");
          failed = true;
          return null;
        }
      }),
    )
  ).filter((source): source is KnowledgeSource => source !== null);
  return { sources, failed };
}

export function knowledgeContext(sources: KnowledgeSource[], failed: boolean) {
  return `ARTIKELOPSLAG FORETAGET NU PÅ AT/NFA/BFA. Kun følgende læste sider må bruges. ${failed ? "Mindst ét opslag fejlede; sig åbent at dækningen er ufuldstændig." : ""}
Hvis ingen af siderne handler om spørgsmålet, svar: ${NO_KNOWLEDGE}
Hver opsummering skal indeholde mindst ét kort ordret citat fra sidens tekst som dokumentation. Angiv citatet i opsummeringen; de øvrige linjer må kun forklare det læste indhold. Maks. 3 kilder.
${sources.map((source) => JSON.stringify(source)).join("\n\n")}`;
}

export function validateKnowledgeAnswer(
  answer: string,
  sources: KnowledgeSource[],
  laws: VerifiedLaw[],
  question = "",
) {
  const excerpts = (items: KnowledgeSource[]) => {
    const words = searchTerms(question).split(" ");
    return items
      .slice(0, 3)
      .map((source) => {
        const sentences = source.text
          .replace(/https:\/\/\S+/g, "")
          .split(/(?<=[.!?])\s+/)
          .filter((sentence) => sentence.length >= 40 && sentence.length <= 600);
        const ranked = sentences
          .map((text, index) => ({
            text,
            index,
            score: words.filter((word) => text.toLowerCase().includes(word)).length,
          }))
          .sort((a, b) => b.score - a.score || a.index - b.index)
          .slice(0, 3);
        const selected = ranked.length
          ? ranked.map((item) => item.text)
          : [source.text.slice(0, 400)];
        return `## 📚 Kilde\n${source.source}\n\n## 📄 Artikel eller vejledning\n${source.title}\n\n## 🔗 Direkte link\n[${source.title}](${source.url})\n\n## 📝 Kort opsummering\n*Den genererede opsummering kunne ikke godkendes. Her er ordrette uddrag fra den læste kilde:*\n${selected.map((text) => `- “${text.replace(/[“”"]/g, "'")}”`).join("\n")}`;
      })
      .join("\n\n");
  };
  if (!sources.length) return NO_KNOWLEDGE;
  if (answer.trim() === NO_KNOWLEDGE) return answer;
  const urls = answer.match(/https?:\/\/[^\s)\]>"“”]+/g) ?? [];
  const articleUrls = urls.filter((url) => !url.includes("retsinformation.dk"));
  const cited = sources.filter((source) =>
    articleUrls.some((url) => knowledgeUrl(url) === source.url),
  );
  if (
    !cited.length ||
    cited.length > 3 ||
    articleUrls.some((url) => !sources.some((source) => knowledgeUrl(url) === source.url))
  )
    return excerpts(cited.length ? cited : sources);
  const quotes = [...answer.matchAll(/[“"]([^“”"\n]{25,})[”"]/g)].map((match) =>
    match[1].replace(/\s+/g, " ").trim(),
  );
  if (cited.some((source) => !quotes.some((quote) => source.text.includes(quote))))
    return excerpts(cited);
  const checked = validateAnswer(answer, laws, question);
  if (
    checked.startsWith("Jeg kan ikke bekræfte alle lovhenvisninger") ||
    checked.startsWith("Jeg kan bekræfte dokumenternes aktuelle status, men ikke")
  )
    return excerpts(cited) + "\n\n*Lovhenvisningen kunne ikke bekræftes og er udeladt.*";
  return checked;
}

export function knowledgeAnswerTransform(
  sources: KnowledgeSource[],
  laws: VerifiedLaw[],
  question: string,
  failed: boolean,
): StreamTextTransform<ToolSet> {
  return () => {
    const buffers = new Map<string, string>();
    return new TransformStream({
      transform(chunk, controller) {
        if (chunk.type === "text-delta") {
          buffers.set(chunk.id, (buffers.get(chunk.id) ?? "") + chunk.text);
          return;
        }
        if (chunk.type === "text-end") {
          const answer = validateKnowledgeAnswer(
            buffers.get(chunk.id) ?? "",
            sources,
            laws,
            question,
          );
          controller.enqueue({
            type: "text-delta",
            id: chunk.id,
            text:
              answer +
              (failed
                ? "\n\n*Ikke alle kildeopslag kunne gennemføres; resultatet kan være ufuldstændigt.*"
                : ""),
          });
          buffers.delete(chunk.id);
        }
        controller.enqueue(chunk);
      },
    });
  };
}
