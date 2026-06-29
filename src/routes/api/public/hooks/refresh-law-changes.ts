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

async function fetchInBatches(dates: string[], concurrency = 8): Promise<RetsinfoDoc[]> {
  const out: RetsinfoDoc[] = [];
  for (let i = 0; i < dates.length; i += concurrency) {
    const batch = dates.slice(i, i + concurrency);
    const results = await Promise.all(batch.map((d) => fetchChangesForDate(d).catch(() => [])));
    for (const r of results) out.push(...r);
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

          // Default: scan the last 3 days every run (cron is hourly).
          const today = new Date();
          const from = fromParam ? new Date(`${fromParam}T00:00:00Z`) : (() => {
            const d = new Date(today);
            d.setUTCDate(d.getUTCDate() - 3);
            return d;
          })();
          const to = toParam ? new Date(`${toParam}T00:00:00Z`) : today;

          const dates = daysBetween(from, to);
          const docs = await fetchInBatches(dates);

          // Filter to arbejdsmiljø-domain documents (ressort "lta" in ELI href).
          const lta = docs.filter((d) => (d.href ?? "").includes("/eli/lta/"));

          // De-duplicate by documentId, prefer the newest changeDate.
          const map = new Map<string, RetsinfoDoc>();
          for (const d of lta) {
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
              short_name: d.documentType?.shortName ?? null,
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

          return Response.json({ ok: true, inserted: rows.length, scanned_days: dates.length });
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
