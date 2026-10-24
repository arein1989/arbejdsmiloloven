import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { BOTS, isBotId } from "@/lib/bots";

type ChatRequestBody = {
  messages?: unknown;
  botId?: unknown;
  threadId?: unknown;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages, botId, threadId } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        if (typeof botId !== "string" || !isBotId(botId)) {
          return new Response("Invalid botId", { status: 400 });
        }
        if (typeof threadId !== "string" || !threadId) {
          return new Response("Invalid threadId", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const bot = BOTS[botId];
        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const uiMessages = messages as UIMessage[];
        const modelMessages = await convertToModelMessages(uiMessages);
        const { collectLaws, lawContext, lawAnswerTransform } =
          await import("@/lib/law-verification.server");
        const question = uiMessages
          .filter((message) => message.role === "user")
          .map((message) =>
            message.parts
              .filter((part) => part.type === "text")
              .map((part) => part.text)
              .join(" "),
          )
          .join("\n");
        const knowledge = botId === "viden"
          ? await import("@/lib/knowledge-sources.server")
          : null;
        const articles = knowledge ? await knowledge.collectKnowledge(question, request.signal) : null;
        const laws =
          botId === "plan" ? [] : await collectLaws(
            botId === "viden" ? articles?.sources.map(source => source.text).join("\n") ?? "" : bot.system,
            botId === "viden" ? "" : question,
            request.signal,
          );
        const verifiedContext = botId === "plan" ? "" : lawContext(laws, question);
        const articleContext = knowledge && articles ? knowledge.knowledgeContext(articles.sources, articles.failed) : "";

        const result = streamText({
          model,
          ...(knowledge && articles
            ? { experimental_transform: knowledge.knowledgeAnswerTransform(articles.sources, laws, question, articles.failed) }
            : botId !== "plan"
            ? { experimental_transform: lawAnswerTransform(laws, question, botId) }
            : {}),
          system: `${bot.system}

${verifiedContext}

${articleContext}

DIREKTE LINKS TIL PARAGRAFFER: Når du henviser til en bestemt paragraf i en lov eller bekendtgørelse på retsinformation.dk, skal linket gå direkte til paragraffen ved at tilføje "#P" og paragrafnummeret til den verificerede adresse, fx https://www.retsinformation.dk/eli/lta/2026/442#P15 for § 15. Lav ét link pr. paragraf, og lad linkteksten nævne paragraffen (fx "[§ 15 i lov om arbejdsmiljø](https://www.retsinformation.dk/eli/lta/2026/442#P15)"). Gengiv også kort, hvad paragraffen siger, så brugeren får svaret direkte. Brug kun #P-ankre med paragrafnumre, du er sikker på.`,
          messages: modelMessages,
          onError: ({ error }) => console.error("AI stream error", error),
        });

        return result.toUIMessageStreamResponse({
          originalMessages: uiMessages,
          onFinish: async ({ messages: finalMessages }) => {
            try {
              const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
              const lastUser = [...finalMessages].reverse().find((m) => m.role === "user");
              const lastAssistant = [...finalMessages]
                .reverse()
                .find((m) => m.role === "assistant");
              const textOf = (m: UIMessage | undefined) =>
                m ? m.parts.map((p) => (p.type === "text" ? p.text : "")).join("") : "";

              const rows: Array<{ thread_id: string; role: string; content: string }> = [];
              if (lastUser)
                rows.push({ thread_id: threadId, role: "user", content: textOf(lastUser) });
              if (lastAssistant)
                rows.push({
                  thread_id: threadId,
                  role: "assistant",
                  content: textOf(lastAssistant),
                });

              if (rows.length) {
                const { error } = await supabaseAdmin.from("messages").insert(rows);
                if (error) console.error("Failed to persist messages", error);
              }

              // Update title from first user message if still default
              const { data: thread } = await supabaseAdmin
                .from("threads")
                .select("title")
                .eq("id", threadId)
                .maybeSingle();
              if (thread && thread.title === "Ny samtale" && lastUser) {
                const title = textOf(lastUser).slice(0, 60).trim() || "Ny samtale";
                await supabaseAdmin.from("threads").update({ title }).eq("id", threadId);
              }
            } catch (e) {
              console.error("onFinish error", e);
            }
          },
        });
      },
    },
  },
});
