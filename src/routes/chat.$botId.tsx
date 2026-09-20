import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { isBotId } from "@/lib/bots";

export const Route = createFileRoute("/chat/$botId")({
  beforeLoad: ({ params }) => {
    if (!isBotId(params.botId)) {
      throw redirect({ to: "/" });
    }
  },
  head: ({ params }) => {
    const titles = {
      problem: "Arbejdsmiljøloven",
      regler: "Regler",
      viden: "Viden om arbejdsmiljø",
      plan: "Handlingsplan",
    } as const;
    const pageTitle = isBotId(params.botId) ? titles[params.botId] : "Arbejdsmiljø";
    const description = `${pageTitle} — få hjælp til arbejdsmiljøarbejdet på Arbejdsmiljøloven.dk.`;

    return {
      meta: [
        { title: `${pageTitle} — Arbejdsmiljøloven.dk` },
        { name: "description", content: description },
        { property: "og:title", content: `${pageTitle} — Arbejdsmiljøloven.dk` },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/chat/${params.botId}` },
        { name: "twitter:card", content: "summary" },
      ],
      links: [{ rel: "canonical", href: `/chat/${params.botId}` }],
    };
  },
  component: () => <Outlet />,
});
