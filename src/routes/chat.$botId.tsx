import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isBotId } from "@/lib/bots";

export const Route = createFileRoute("/chat/$botId")({
  beforeLoad: ({ params }) => {
    if (!isBotId(params.botId)) {
      throw redirect({ to: "/" });
    }
  },
  component: () => <Outlet />,
});
