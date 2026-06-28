
CREATE TABLE public.law_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id text NOT NULL UNIQUE,
  short_name text,
  change_date date,
  href text,
  reason text,
  fetched_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.law_changes TO anon, authenticated;
GRANT ALL ON public.law_changes TO service_role;

ALTER TABLE public.law_changes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read law_changes"
ON public.law_changes
FOR SELECT
TO anon, authenticated
USING (true);

CREATE INDEX law_changes_change_date_idx ON public.law_changes (change_date DESC);
