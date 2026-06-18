import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BOT_LIST } from "@/lib/bots";
import heroAsset from "@/assets/hero-forside.jpg.asset.json";
import { ArrowRight, ScrollText, Scale, Search, FileCheck2 } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "arbejdsmiljøhjælp.dk – AI-assistenter til arbejdsmiljø" },
      {
        name: "description",
        content:
          "Få hurtig hjælp til arbejdsmiljøproblemer, lovgivning, viden og handlingsplaner med 4 specialiserede AI-assistenter.",
      },
      { property: "og:title", content: "arbejdsmiljøhjælp.dk" },
      {
        property: "og:description",
        content:
          "4 AI-assistenter til arbejdsmiljø: problemløsning, juridisk opslag, vidensøgning og handlingsplaner.",
      },
    ],
  }),
  component: Home,
});

const icons = {
  problem: ScrollText,
  regler: Scale,
  viden: Search,
  plan: FileCheck2,
} as const;

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border/60 bg-surface">
        <div className="w-full">
          <img
            src={heroAsset.url}
            alt="Konference om arbejdsmiljø"
            className="h-56 w-full object-cover sm:h-72 md:h-96"
          />
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
          <div className="mt-8 max-w-3xl">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Velkommen til Arbejdsmiljøloven.dk!
            </h1>
            <h3 className="mt-3 text-base font-semibold text-black sm:text-lg">
              Arbejdsmiljøloven.dk har – 4 AI assistenter på samme hjemmeside
            </h3>
            <p className="mt-[2px] text-base text-muted-foreground sm:text-lg">
              AdWeyse har udviklet Arbejdsmiljøloven.dk, for at samle alt tilgængeligt offentligt udgivet arbejdsmiljømateriale på et sted og for at gøre det nemt at finde frem til det der kan hjælpe jer i jeres arbejdsmiljøarbejde.
              Brug de 4 forskellige AI-assistenter, en på hver side, der har 4 forskellige formål, og få svar på specifikke arbejdsmiljøspørgsmål eller få fat i det materiale som I har brug for i jeres videre arbejde.
            </p>
          </div>
        </div>
      </section>

      {/* Bot grid */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-semibold">Vælg en assistent</h2>
          <span className="text-xs text-muted-foreground">Samtaler gemmes i 1 time</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {BOT_LIST.map((b) => {
            const Icon = icons[b.id];
            return (
              <Link
                key={b.id}
                to="/chat/$botId"
                params={{ botId: b.id }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md"
              >
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-8 translate-x-8 rounded-full bg-primary/5 transition-all group-hover:scale-150" />
                <div className="relative flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Icon size={22} />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-medium uppercase tracking-wider text-primary/80">
                      Bot {b.number}
                    </div>
                    <h3 className="mt-1 font-display text-xl font-semibold text-foreground">
                      {b.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">{b.description}</p>
                    <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Start samtale <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
