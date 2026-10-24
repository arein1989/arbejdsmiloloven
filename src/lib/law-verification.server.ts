import { XMLParser, XMLValidator } from "fast-xml-parser";
import type { StreamTextTransform, ToolSet } from "ai";

export type VerifiedLaw = {
  url: string;
  title: string;
  status: "current" | "historic" | "unknown";
  checkedAt: string;
  paragraphs: Record<string, string>;
  text: string;
};

export function lawUrl(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      !["retsinformation.dk", "www.retsinformation.dk"].includes(url.hostname)
    )
      return null;
    const match = url.pathname.match(/^\/eli\/(lta|retsinfo)\/\d{4}\/\d+\/?$/);
    return match ? `https://www.retsinformation.dk${url.pathname.replace(/\/$/, "")}` : null;
  } catch {
    return null;
  }
}

function textOf(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.map(textOf).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(textOf).join(" ");
  return "";
}

export function parseLawXml(xml: string, url: string, checkedAt: string): VerifiedLaw {
  const unknown: VerifiedLaw = {
    url,
    title: "",
    status: "unknown",
    checkedAt,
    paragraphs: {},
    text: "",
  };
  if (XMLValidator.validate(xml) !== true || /<!DOCTYPE/i.test(xml)) return unknown;
  const parsed = new XMLParser({ ignoreAttributes: true, parseTagValue: false }).parse(xml);
  const root = parsed?.Dokument;
  if (!root?.Meta?.DocumentTitle) return unknown;
  const paragraphs: Record<string, string> = {};
  function visit(value: unknown, key = "") {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) {
      value.forEach((item) => visit(item, key));
      return;
    }
    const node = value as Record<string, unknown>;
    if (key === "Paragraf") {
      const number = textOf(node.Explicatus)
        .match(/§\s*(\d+\s*[a-z]?)/i)?.[1]
        ?.replace(/\s/g, "");
      if (number) paragraphs[number] = textOf(node).replace(/\s+/g, " ").trim();
    }
    Object.entries(node).forEach(([childKey, child]) => visit(child, childKey));
  }
  visit(root);
  return {
    url,
    checkedAt,
    paragraphs,
    title: textOf(root.Meta.DocumentTitle),
    status:
      root.Meta.Status === "Valid"
        ? "current"
        : root.Meta.Status === "Historic"
          ? "historic"
          : "unknown",
    text: textOf(root).replace(/\s+/g, " ").trim(),
  };
}

export async function verifyLaw(url: string, signal?: AbortSignal): Promise<VerifiedLaw> {
  const checkedAt = new Date().toISOString();
  const unknown: VerifiedLaw = {
    url,
    title: "",
    status: "unknown",
    checkedAt,
    paragraphs: {},
    text: "",
  };
  const canonical = lawUrl(url);
  if (!canonical) return unknown;
  try {
    const response = await fetch(`${canonical}/xml`, {
      signal,
      redirect: "error",
      headers: { Accept: "application/xml" },
    });
    if (!response.ok) return unknown;
    return parseLawXml(await response.text(), canonical, checkedAt);
  } catch (error) {
    if (signal?.aborted) throw error;
    return unknown;
  }
}

export async function collectLaws(system: string, question: string, signal?: AbortSignal) {
  const urls = [
    ...new Set(
      (
        `${system}\n${question}`.match(
          /https:\/\/(?:www\.)?retsinformation\.dk\/eli\/(?:lta|retsinfo)\/\d{4}\/\d+/g,
        ) ?? []
      )
        .map(lawUrl)
        .filter((url): url is string => Boolean(url)),
    ),
  ].slice(0, 20);
  const laws: VerifiedLaw[] = [];
  for (let i = 0; i < urls.length; i += 4) {
    laws.push(...(await Promise.all(urls.slice(i, i + 4).map((url) => verifyLaw(url, signal)))));
  }
  return laws;
}

export function lawContext(laws: VerifiedLaw[], question: string): string {
  const words = question.toLowerCase().match(/[a-zæøå]{4,}/g) ?? [];
  const requested = [...question.matchAll(/§\s*(\d+\s*[a-z]?)/gi)].map((m) =>
    m[1].replace(/\s/g, ""),
  );
  return `KILDEKONTROL — autoritativt opslag foretaget nu. Status gælder Retsinformations dokumentstatus, ikke en garanti for at enhver fortolkning er korrekt.
Du må kun bruge nedenstående dokumenter med status current til lovhenvisninger. Historiske og ukontrollerede dokumenter må ikke bruges som gældende ret. Brug kun paragraftekster fra opslaget; oplys usikkerhed, hvis relevant tekst mangler. Citér hver juridisk påstand med dokumentets URL og eksisterende #P-anker. Genbrug ikke ukontrollerede henvisninger fra tidligere svar. Vejledninger er vejledning, ikke lovkrav. Du har ikke søgt på AT/NFA/BFA og må ikke påstå det.
For hver paragrafhenvisning SKAL du gengive første sætning af den hentede paragraf ordret som blokcitat og linke direkte til #P-ankeret. Forklar først derefter relevansen. Afvis brugerens forkerte paragrafnumre, hvis teksten ikke handler om spørgsmålet. Brug aldrig tal eller minimumskrav fra hukommelsen, når de ikke står i den hentede tekst.
${laws
  .map((law) => {
    const entries = Object.entries(law.paragraphs);
    const ranked = entries
      .map(([number, text]) => ({
        number,
        text,
        score:
          (requested.includes(number) ? 100 : 0) +
          words.filter((word) => text.toLowerCase().includes(word)).length,
      }))
      .sort((a, b) => b.score - a.score);
    const excerpt = entries.length
      ? ranked
          .slice(0, 5)
          .map(({ number, text }) => `${law.url}#P${number}\n${text}`)
          .join("\n")
          .slice(0, 6000)
      : law.text.slice(0, 3500);
    return `${law.title || "Ukendt dokument"}\n${law.url}\nStatus: ${law.status}; kontrolleret ${law.checkedAt}\n${law.status === "current" ? excerpt : "Må ikke citeres som gældende."}`;
  })
  .join("\n\n")}`;
}

export function validateAnswer(answer: string, laws: VerifiedLaw[], question = ""): string {
  const urls = answer.match(/https?:\/\/(?:www\.)?retsinformation\.dk[^\s)\]>"“”]+/g) ?? [];
  const invalid = urls.some((url) => {
    const canonical = lawUrl(url);
    const law = laws.find((item) => item.url === canonical);
    if (!law || law.status !== "current") return true;
    const hash = new URL(url).hash;
    return Boolean(hash && (!/^#P\d+[a-z]?$/i.test(hash) || !law.paragraphs[hash.slice(2)]));
  });
  if (invalid)
    return "Jeg kan ikke bekræfte alle lovhenvisninger i dette svar og viser derfor ikke den ukontrollerede vurdering.\n\nBed mig gerne om en bestemt lov eller paragraf med dens officielle link, så jeg kan kontrollere den. Jeg vil ikke henvise til en historisk eller ubekræftet version som gældende ret.";
  const current = laws.filter((law) => law.status === "current");
  const cited = current.filter((law) => urls.some((url) => lawUrl(url) === law.url));
  const references = urls.flatMap((url) => {
    const law = cited.find((item) => item.url === lawUrl(url));
    const number = new URL(url).hash.slice(2);
    return law && number && law.paragraphs[number]
      ? [{ law, number, text: law.paragraphs[number] }]
      : [];
  });
  const normalized = answer.replace(/[*_>]/g, "").replace(/\s+/g, " ");
  const missingEvidence =
    /§\s*\d/.test(answer) &&
    (!references.length ||
      references.some(({ text, number }) => {
        const body = text.replace(new RegExp(`^§\\s*${number}\\.\\s*`), "");
        const firstSentence = body.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? body.slice(0, 160);
        return !normalized.includes(firstSentence);
      }));
  if (missingEvidence) {
    const requestedNumbers = [
      ...question.matchAll(
        /§{1,2}\s*(\d+(?:\s*[a-z](?![a-z]))?)(?:\s+og\s+(\d+(?:\s*[a-z](?![a-z]))?))?/gi,
      ),
    ].flatMap((match) =>
      [match[1], match[2]].filter(Boolean).map((number) => number.replace(/\s/g, "")),
    );
    const requestedSources = cited.flatMap((law) =>
      requestedNumbers
        .filter((number) => law.paragraphs[number])
        .map((number) => ({ law, number, text: law.paragraphs[number] })),
    );
    const sources = requestedSources.length
      ? requestedSources
      : references.length
        ? references
        : cited.flatMap((law) =>
            Object.entries(law.paragraphs)
              .slice(0, 2)
              .map(([number, text]) => ({ law, number, text })),
          );
    return `Jeg kan bekræfte dokumenternes aktuelle status, men ikke den foreslåede paragrafforklaring. Derfor viser jeg den officielle ordlyd i stedet for en ukontrolleret vurdering.\n\n${sources
      .slice(0, 4)
      .map(
        ({ law, number, text }) =>
          `**${law.title} — [§ ${number}](${law.url}#P${number})**\n\n> ${text}`,
      )
      .join(
        "\n\n",
      )}\n\n*Kilder kontrolleret på Retsinformation ${cited[0]?.checkedAt.slice(0, 10) ?? "ved dette opslag"}. Ordlyden skal vurderes i forhold til den konkrete situation.*`;
  }
  const note = cited.length
    ? `\n\n*Kildekontrol: De citerede dokumenter var markeret gældende på Retsinformation ved opslag ${cited[0]?.checkedAt.slice(0, 10)}. Juridisk fortolkning kan kræve faglig vurdering.*`
    : "";
  const failures = laws.some((law) => law.status === "unknown");
  return (
    answer +
    note +
    (failures
      ? "\n\n*Nogle lovkilder kunne ikke kontrolleres og er ikke godkendt som grundlag for lovhenvisninger.*"
      : "")
  );
}

// Hold generated legal text until validation, while retaining the upstream streaming call.
export function lawAnswerTransform(
  laws: VerifiedLaw[],
  question = "",
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
          controller.enqueue({
            type: "text-delta",
            id: chunk.id,
            text: validateAnswer(buffers.get(chunk.id) ?? "", laws, question),
          });
          buffers.delete(chunk.id);
        }
        controller.enqueue(chunk);
      },
    });
  };
}
