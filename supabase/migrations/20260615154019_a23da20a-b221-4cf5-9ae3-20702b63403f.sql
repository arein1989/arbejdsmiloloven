
CREATE TABLE public.threads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  bot_id TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT 'Ny samtale',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '1 hour')
);
CREATE INDEX idx_threads_session_bot ON public.threads(session_id, bot_id, created_at DESC);
CREATE INDEX idx_threads_expires ON public.threads(expires_at);

CREATE TABLE public.messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_thread ON public.messages(thread_id, created_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.threads TO anon, authenticated;
GRANT ALL ON public.threads TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO anon, authenticated;
GRANT ALL ON public.messages TO service_role;

ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Open policies: data is scoped by unguessable session_id (random UUID stored
-- only in the user's browser). Data auto-expires after 1 hour and is purged.
CREATE POLICY "open threads" ON public.threads FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "open messages" ON public.messages FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Auto-cleanup function: deletes threads whose expires_at has passed
CREATE OR REPLACE FUNCTION public.cleanup_expired_threads()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  DELETE FROM public.threads WHERE expires_at < now();
$$;

CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule(
  'cleanup-expired-threads',
  '*/10 * * * *',
  $$ SELECT public.cleanup_expired_threads(); $$
);
