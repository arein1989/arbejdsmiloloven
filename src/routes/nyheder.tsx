import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import heroAsset from "@/assets/arbejdsmiljøloven.jpg.asset.json";
import { getNews, type NewsSource } from "@/lib/news.functions";

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

const NEWS_TABS: Array<{ key: NewsSource; label: string }> = [
  { key: "at", label: "AT:DK" },
  { key: "bfa", label: "BFA" },
  { key: "nfa", label: "NFA" },
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("da-DK", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function NewsPage() {
  const [source, setSource] = useState<NewsSource>("at");

  const { data, isLoading } = useQuery({
    queryKey: ["news", source],
    queryFn: () => getNews({ data: { source } }),
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const items = data?.items ?? [];
  const error = data?.error ?? null;
  const activeTab = NEWS_TABS.find((tab) => tab.key === source);

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
            Her finder du de seneste nyheder fra AT, BFA og NFA. Vi ønsker at give jer hurtig og nem
            adgang til up-to-date viden om arbejdsmiljø, forebyggelse, trivsel og lovkrav.
          </p>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3 sm:gap-4" role="tablist">
            {NEWS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={source === tab.key}
                onClick={() => setSource(tab.key)}
                className={`flex items-center justify-center rounded-md bg-gradient-to-r from-plan-top to-plan-bottom px-3 py-3 font-serif text-sm font-semibold text-white shadow-plan transition-all duration-200 sm:text-base ${
                  source === tab.key
                    ? "ring-2 ring-plan-top ring-offset-2"
                    : "opacity-75 hover:opacity-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-8" role="tabpanel">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Henter nyheder…</p>
            ) : error ? (
              <p className="text-sm text-destructive">
                {error}{" "}
                {activeTab ? (
                  <a
                    href={
                      activeTab.key === "at"
                        ? "https://at.dk/nyheder/"
                        : activeTab.key === "bfa"
                          ? "https://www.godtarbejdsmiljo.dk/soegeresultat?q=nyheder"
                          : "https://nfa.dk/nyt"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold underline"
                  >
                    Se {activeTab.label} her
                  </a>
                ) : null}
              </p>
            ) : items.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen nyheder fundet lige nu.</p>
            ) : (
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/30 sm:p-5"
                    >
                      <h3 className="text-base font-semibold text-foreground sm:text-lg">
                        {item.title}
                      </h3>
                      {item.date ? (
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(item.date)}</p>
                      ) : null}
                      {item.text ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                          {item.text}
                        </p>
                      ) : null}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
