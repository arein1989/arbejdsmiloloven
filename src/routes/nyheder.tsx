import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { LatestLawChanges } from "@/components/LatestLawChanges";
import heroAsset from "@/assets/arbejdsmiljøloven.jpg.asset.json";

export const Route = createFileRoute("/nyheder")({
  head: () => ({
    meta: [
      { title: "Nyheder — Arbejdsmiljøloven.dk" },
      {
        name: "description",
        content: "Læs nyheder om arbejdsmiljø, lovændringer og nye regler på Arbejdsmiljøloven.dk.",
      },
      { property: "og:title", content: "Nyheder — Arbejdsmiljøloven.dk" },
      {
        property: "og:description",
        content: "Nyheder om arbejdsmiljø, lovændringer og nye regler.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/nyheder" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/nyheder" }],
  }),
  component: NewsPage,
});

function NewsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <main>
        <img
          src={heroAsset.url}
          alt="Arbejdsmiljø i praksis"
          className="h-56 w-full object-cover sm:h-72 md:h-96"
        />

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Nyheder</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-foreground sm:text-lg">
            Her finder du nyheder om arbejdsmiljø, lovændringer og nye regler.
          </p>
        </section>

        <LatestLawChanges />
      </main>

      <SiteFooter />
    </div>
  );
}