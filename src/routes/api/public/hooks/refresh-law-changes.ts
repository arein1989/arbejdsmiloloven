import { createFileRoute } from "@tanstack/react-router";

type RetsinfoDoc = {
  documentId?: string;
  accessionsnummer?: string;
  changeDate?: string;
  href?: string;
  reasonForChange?: string;
  documentType?: { shortName?: string | null } | null;
};

async function fetchChangesForDate(date?: string): Promise<RetsinfoDoc[]> {
  const url = date
    ? `https://api.retsinformation.dk/v1/Documents?date=${date}`
    : `https://api.retsinformation.dk/v1/Documents`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Retsinformation API ${res.status}: ${body.slice(0, 300)}`);
  }
  const json = (await res.json()) as RetsinfoDoc[] | { errors?: string[] };
  if (!Array.isArray(json)) {
    throw new Error(`Retsinformation API error: ${JSON.stringify(json)}`);
  }
  return json;
}

export const Route = createFileRoute("/api/public/hooks/refresh-law-changes")({
  server: {
    handlers: {
      POST: async () => {
        try {
          // Try today first, fall back to the last 10 days if the service is closed.
          let docs: RetsinfoDoc[] = [];
          try {
            docs = await fetchChangesForDate();
          } catch (e) {
            console.warn("[refresh-law-changes] today failed, scanning recent days", e);
            for (let i = 1; i <= 10; i++) {
              const d = new Date();
              d.setUTCDate(d.getUTCDate() - i);
              const iso = d.toISOString().slice(0, 10);
              try {
                const part = await fetchChangesForDate(iso);
                docs = docs.concat(part);
              } catch (err) {
                console.warn(`[refresh-law-changes] ${iso} failed`, err);
              }
            }
          }

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
            .slice(0, 30)
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
            return Response.json({ ok: true, inserted: 0, note: "no arbejdsmiljø changes" });
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

          return Response.json({ ok: true, inserted: rows.length });
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
