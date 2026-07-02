import { createServerFn } from "@tanstack/react-start";

export type LawChange = {
  document_id: string;
  short_name: string | null;
  change_date: string | null;
  href: string | null;
  reason: string | null;
};

export const getLatestLawChanges = createServerFn({ method: "GET" }).handler(
  async (): Promise<LawChange[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("law_changes")
      .select("document_id, short_name, change_date, href, reason")
      .order("change_date", { ascending: false, nullsFirst: false })
      .limit(5);
    if (error) {
      console.error("[lawChanges] read failed", error);
      return [];
    }
    return data ?? [];
  },
);
