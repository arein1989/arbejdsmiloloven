import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SessionInput = z.object({ sessionId: z.string().uuid() });

const ListThreadsInput = SessionInput.extend({
  botId: z.enum(["problem", "regler", "viden", "plan"]),
});

const CreateThreadInput = ListThreadsInput;

const ThreadIdInput = SessionInput.extend({ threadId: z.string().uuid() });

export const listThreads = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ListThreadsInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("threads")
      .select("id, title, created_at, expires_at, bot_id")
      .eq("session_id", data.sessionId)
      .eq("bot_id", data.botId)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const createThread = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CreateThreadInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("threads")
      .insert({ session_id: data.sessionId, bot_id: data.botId })
      .select("id, title, created_at, expires_at, bot_id")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const getThreadMessages = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ThreadIdInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: thread, error: tErr } = await supabaseAdmin
      .from("threads")
      .select("id, title, created_at, expires_at, bot_id, session_id")
      .eq("id", data.threadId)
      .maybeSingle();
    if (tErr) throw new Error(tErr.message);
    if (!thread || thread.session_id !== data.sessionId) {
      return { thread: null, messages: [] };
    }
    const { data: msgs, error: mErr } = await supabaseAdmin
      .from("messages")
      .select("id, role, content, created_at")
      .eq("thread_id", data.threadId)
      .order("created_at", { ascending: true });
    if (mErr) throw new Error(mErr.message);
    return { thread, messages: msgs ?? [] };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ThreadIdInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Only delete if session matches
    const { error } = await supabaseAdmin
      .from("threads")
      .delete()
      .eq("id", data.threadId)
      .eq("session_id", data.sessionId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
