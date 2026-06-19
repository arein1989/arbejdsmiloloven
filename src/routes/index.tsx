import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BOT_LIST } from "@/lib/bots";
import heroAsset from "@/assets/hero-forside.jpg.asset.json";
import robotMascot from "@/assets/chatbot.png.asset.json";

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

const cardData: Record<string, { label: string; title: string; description: string; gradient: string }> = {
  problem: { label: "Siden 1", title: "Arbejdsmiljoloven", description: "Få svar på et specifikt arbejdsmiljøproblem", gradient: "linear-gradient(180deg, #00A86B 0%, #007A4F 100%)" },
  regler: { label: "Siden 2", title: "Regelfinder", description: "Find en specifik bekendtgørelse eller AT-vejledning", gradient: "linear-gradient(180deg, #04C27E 0%, #8CC63E 100%)" },
  viden: { label: "Siden 3", title: "Viden om Arbejdsmiljø", description: "Søg viden på AT.dk, NFA.dk. BFA-WEB.dk", gradient: "linear-gradient(180deg, #007A4F 0%, #F78D0B 100%)" },
  plan: { label: "Siden 4", title: "Handlingsplan", description: "Opret et dokument, sæt det ind og få lavet en plan for jeres arbejdsmiljøudfordring inden for lovens rammer.", gradient: "linear-gradient(180deg, #58D500 0%, #007A4F 100%)" },
};

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero */}
      <section className="bg-white">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BOT_LIST.map((b) => {
            const data = cardData[b.id];
            return (
              <Link
                key={b.id}
                to="/chat/$botId"
                params={{ botId: b.id }}
                className="group flex flex-col items-center rounded-2xl p-6 text-center text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: data.gradient }}
              >
                <img
                  src={robotMascot.url}
                  alt="Robot"
                  width={64}
                  height={64}
                  className="mb-3 h-16 w-16 object-contain"
                  loading="lazy"
                />
                <div className="text-sm font-medium">{data.label}</div>
                <h3 className="mt-1 text-xl font-semibold">{data.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-90">{data.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Description after bots */}
      <section className="mx-auto max-w-6xl px-4 pb-10 pt-8 sm:px-6">
        <div className="max-w-3xl">
          <p className="text-base text-muted-foreground sm:text-lg">
            Arbejdsmiljøloven.dk er lavet til dig, der har brug for konkret viden indenfor arbejdsmiljølovgivningen, eller har brug for, at finde en specifik bekendtgørelse, AT-vejledning, eller materiale udgivet af Arbejdstilsynet, NFA eller BFA'erne.
          </p>
          <p className="mt-3 text-base text-muted-foreground sm:text-lg">
            Som noget særligt, kan vi også hjælpe med, at finde løsninger på jeres arbejdsmiljøudfordringer.
          </p>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
