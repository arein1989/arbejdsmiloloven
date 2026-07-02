import { createFileRoute } from "@tanstack/react-router";

type RetsinfoDoc = {
  documentId?: string;
  accessionsnummer?: string;
  changeDate?: string;
  href?: string;
  reasonForChange?: string;
  documentType?: { shortName?: string | null } | null;
};

async function fetchChangesForDate(date: string): Promise<RetsinfoDoc[]> {
  const url = `https://api.retsinformation.dk/v1/Documents?date=${date}`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) return [];
  const json = (await res.json()) as RetsinfoDoc[] | { errors?: string[] };
  if (!Array.isArray(json)) return [];
  return json;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function daysBetween(from: Date, to: Date): string[] {
  const out: string[] = [];
  const cur = new Date(from.getTime());
  while (cur <= to) {
    out.push(isoDate(cur));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return out;
}

async function fetchInBatches(dates: string[], concurrency = 4): Promise<RetsinfoDoc[]> {
  const out: RetsinfoDoc[] = [];
  for (let i = 0; i < dates.length; i += concurrency) {
    const batch = dates.slice(i, i + concurrency);
    const results = await Promise.all(batch.map((d) => fetchChangesForDate(d).catch(() => [])));
    for (const r of results) out.push(...r);
  }
  return out;
}

// Fetch document XML and check if it's arbejdsmiljø-related. Returns title if so.
async function checkArbejdsmiljoDoc(href: string): Promise<{ isArbejdsmiljo: boolean; title: string | null }> {
  try {
    const xmlUrl = href.startsWith("http") ? href : `https://retsinformation.dk${href}`;
    const secure = xmlUrl.replace(/^http:/, "https:");
    const res = await fetch(secure, { headers: { Accept: "application/xml" } });
    if (!res.ok) return { isArbejdsmiljo: false, title: null };
    // Only read the first ~8kb — meta is at top of file.
    const reader = res.body?.getReader();
    let text = "";
    if (reader) {
      const dec = new TextDecoder("utf-8");
      let total = 0;
      while (total < 16000) {
        const { value, done } = await reader.read();
        if (done) break;
        text += dec.decode(value, { stream: true });
        total += value.byteLength;
      }
      try {
        await reader.cancel();
      } catch {
        /* ignore */
      }
    } else {
      text = await res.text();
    }
    const titleMatch = text.match(/<DocumentTitle>([^<]+)<\/DocumentTitle>/i);
    const subjectMatch = text.match(/<Subject>([^<]+)<\/Subject>/i);
    const title = titleMatch?.[1]?.trim() ?? null;
    const subject = subjectMatch?.[1]?.trim() ?? "";
    const hay = `${title ?? ""} ${subject}`.toLowerCase();
    const isArbejdsmiljo =
      hay.includes("arbejdsmiljø") ||
      hay.includes("arbejdsmiljo") ||
      hay.includes("arbejdstilsyn");
    return { isArbejdsmiljo, title };
  } catch {
    return { isArbejdsmiljo: false, title: null };
  }
}

async function enrichArbejdsmiljo(
  docs: RetsinfoDoc[],
  concurrency = 6,
): Promise<Array<RetsinfoDoc & { title: string | null }>> {
  const out: Array<RetsinfoDoc & { title: string | null }> = [];
  // Pre-filter: only relevant document types.
  const relevantTypes = new Set(["LOV", "LBK", "BEK", "VEJ", "LBK H", "BEK H"]);
  const candidates = docs.filter((d) => {
    const t = (d.documentType?.shortName ?? "").toUpperCase().trim();
    return !!d.href && relevantTypes.has(t);
  });
  for (let i = 0; i < candidates.length; i += concurrency) {
    const batch = candidates.slice(i, i + concurrency);
    const results = await Promise.all(
      batch.map(async (d) => {
        const { isArbejdsmiljo, title } = await checkArbejdsmiljoDoc(d.href!);
        return isArbejdsmiljo ? { ...d, title } : null;
      }),
    );
    for (const r of results) if (r) out.push(r);
  }
  return out;
}

export const Route = createFileRoute("/api/public/hooks/refresh-law-changes")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const url = new URL(request.url);
          const fromParam = url.searchParams.get("from");
          const toParam = url.searchParams.get("to");

          // Default: scan the last 10 days every run (max supported by API).
          const today = new Date();
          const from = fromParam
            ? new Date(`${fromParam}T00:00:00Z`)
            : (() => {
                const d = new Date(today);
                d.setUTCDate(d.getUTCDate() - 10);
                return d;
              })();
          const to = toParam ? new Date(`${toParam}T00:00:00Z`) : today;

          const dates = daysBetween(from, to);
          const docs = await fetchInBatches(dates);
          const arbejdsmiljoDocs = await enrichArbejdsmiljo(docs);

          // De-duplicate by documentId, prefer the newest changeDate.
          const map = new Map<string, (typeof arbejdsmiljoDocs)[number]>();
          for (const d of arbejdsmiljoDocs) {
            const key = d.documentId ?? d.accessionsnummer ?? d.href ?? "";
            if (!key) continue;
            const prev = map.get(key);
            if (!prev || (d.changeDate ?? "") > (prev.changeDate ?? "")) {
              map.set(key, d);
            }
          }

          const rows = Array.from(map.values())
            .sort((a, b) => (b.changeDate ?? "").localeCompare(a.changeDate ?? ""))
            .map((d) => ({
              document_id: (d.documentId ?? d.accessionsnummer)!,
              short_name: d.title ?? d.documentType?.shortName ?? null,
              change_date: d.changeDate ?? null,
              href: d.href ?? null,
              reason: d.reasonForChange ?? null,
              fetched_at: new Date().toISOString(),
            }))
            .filter((r) => r.document_id);

          if (rows.length === 0) {
            return Response.json({
              ok: true,
              inserted: 0,
              scanned_days: dates.length,
              scanned_docs: docs.length,
              note: "no arbejdsmiljø changes",
            });
          }

          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { error } = await supabaseAdmin
            .from("law_changes")
            .upsert(rows, { onConflict: "document_id" });
          if (error) {
            console.error("[refresh-law-changes] upsert failed", error);
            return new Response(JSON.stringify({ ok: false, error: error.message }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          return Response.json({
            ok: true,
            inserted: rows.length,
            scanned_days: dates.length,
            scanned_docs: docs.length,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e);
          console.error("[refresh-law-changes] failed", msg);
          return new Response(JSON.stringify({ ok: false, error: msg }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
});
