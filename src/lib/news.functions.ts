import { createServerFn } from "@tanstack/react-start";

export type NewsSource = "at" | "bfa" | "nfa";

export type NewsItem = {
  title: string;
  url: string;
  date: string | null;
  text: string | null;
};

function decodeEntities(input: string): string {
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&aelig;/g, "æ")
    .replace(/&oslash;/g, "ø")
    .replace(/&aring;/g, "å")
    .replace(/&AElig;/g, "Æ")
    .replace(/&Oslash;/g, "Ø")
    .replace(/&Aring;/g, "Å")
    .trim();
}

function stripTags(input: string): string {
  return decodeEntities(input.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ");
}

async function fetchAtNews(): Promise<NewsItem[]> {
  const res = await fetch(
    "https://at.ankiro.dk/Rest/at.dk-nyheder/Search.json?q=*&maxResults=20&resultDetail=All",
    { headers: { accept: "application/json" } },
  );
  if (!res.ok) throw new Error(`AT nyheder fejlede (HTTP ${res.status})`);
  const data = (await res.json()) as {
    Documents?: Array<{
      Properties?: Array<{ Name: string; Value: string | null }>;
    }>;
  };
  const items: NewsItem[] = (data.Documents ?? [])
    .map((doc) => {
      const props: Record<string, string | null> = {};
      for (const p of doc.Properties ?? []) props[p.Name] = p.Value;
      return {
        title: (props.Title ?? "").trim(),
        url: (props.Uri ?? "").trim(),
        date: props.LastUpdated ? props.LastUpdated.slice(0, 10) : null,
        text: (props.Description ?? "").trim() || null,
      };
    })
    .filter(
      (item) =>
        item.title.length > 0 &&
        item.url.startsWith("https://at.dk/nyheder/") &&
        item.url !== "https://at.dk/nyheder/",
    )
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
  return items.slice(0, 10);
}

async function fetchBfaNews(): Promise<NewsItem[]> {
  const res = await fetch("https://www.godtarbejdsmiljo.dk/soegeresultat?q=nyheder", {
    headers: { accept: "text/html" },
  });
  if (!res.ok) throw new Error(`BFA nyheder fejlede (HTTP ${res.status})`);
  const html = await res.text();
  const anchorRe = /<a class="search-result[^"]*"[^>]*href="([^"]+)"([\s\S]*?)<\/a>/g;
  const items: NewsItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = anchorRe.exec(html)) !== null && items.length < 10) {
    const url = match[1].startsWith("http")
      ? match[1]
      : `https://www.godtarbejdsmiljo.dk${match[1]}`;
    const block = match[2];
    const titleMatch = block.match(/<h2[^>]*>\s*<span>([\s\S]*?)<\/span>/);
    const textMatch = block.match(/class="search-result__text">([\s\S]*?)<\/div>/);
    const title = titleMatch ? stripTags(titleMatch[1]) : "";
    if (!title) continue;
    items.push({
      title,
      url,
      date: null,
      text: textMatch ? stripTags(textMatch[1]) : null,
    });
  }
  return items;
}

async function fetchNfaNews(): Promise<NewsItem[]> {
  const res = await fetch("https://nfa.dk/nyt", { headers: { accept: "text/html" } });
  if (!res.ok) throw new Error(`NFA nyheder fejlede (HTTP ${res.status})`);
  const html = await res.text();
  const itemRe =
    /<li>\s*<a href="([^"]+)">\s*<span class="search-module__list-module__result-tags">\s*<span class="search-module__list-module__contant-tags"[^>]*>\s*([^<]*)\s*<\/span>\s*\/\s*([0-9-]+)\s*<\/span>\s*<h3[^>]*>\s*([\s\S]*?)\s*<\/h3>/g;
  const items: NewsItem[] = [];
  let match: RegExpExecArray | null;
  while ((match = itemRe.exec(html)) !== null && items.length < 10) {
    const url = match[1].startsWith("http") ? match[1] : `https://nfa.dk${match[1]}`;
    const tag = match[2].trim();
    if (tag !== "Nyheder") continue;
    const title = stripTags(match[4]);
    if (!title) continue;
    items.push({ title, url, date: match[3], text: null });
  }
  return items;
}

export const getNews = createServerFn({ method: "GET" })
  .inputValidator((data: { source: NewsSource }) => data)
  .handler(async ({ data }): Promise<{ items: NewsItem[]; error: string | null }> => {
    try {
      if (data.source === "at") {
        return { items: await fetchAtNews(), error: null };
      }
      if (data.source === "bfa") {
        return { items: await fetchBfaNews(), error: null };
      }
      return { items: await fetchNfaNews(), error: null };
    } catch (err) {
      console.error("[news] fetch failed", data.source, err);
      return { items: [], error: "Kunne ikke hente nyheder lige nu. Prøv igen senere." };
    }
  });
