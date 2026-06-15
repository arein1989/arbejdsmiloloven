import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
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
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!isBotId(botId)) return;
    const sessionId = getSessionId();
    createThread({ data: { sessionId, botId } })
      .then((row) => {
        navigate({
          to: "/chat/$botId/$threadId",
          params: { botId, threadId: row.id },
          replace: true,
        });
      })
      .catch(console.error);
  }, [botId, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
      Starter samtale…
    </div>
  );
}
