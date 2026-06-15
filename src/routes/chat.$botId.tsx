import { createFileRoute, redirect } from "@tanstack/react-router";
import { isBotId } from "@/lib/bots";
import { createThread } from "@/lib/chat.functions";
import { getSessionId } from "@/lib/session";

export const Route = createFileRoute("/chat/$botId")({
  beforeLoad: ({ params }) => {
    if (!isBotId(params.botId)) {
      throw redirect({ to: "/" });
    }
  },
  component: BotEntry,
});

function BotEntry() {
  const { botId } = Route.useParams();
  // Create a new thread on first render, then navigate to it
  if (typeof window !== "undefined" && isBotId(botId)) {
    const sessionId = getSessionId();
    createThread({ data: { sessionId, botId } })
      .then((row) => {
        window.location.replace(`/chat/${botId}/${row.id}`);
      })
      .catch((e) => {
        console.error(e);
      });
  }
  return (
    <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
      Starter samtale…
    </div>
  );
}
