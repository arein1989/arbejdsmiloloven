import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { isBotId } from "@/lib/bots";
import { createThread } from "@/lib/chat.functions";
import { getSessionId } from "@/lib/session";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import videnHeroAsset from "@/assets/arbejdsmiljøloven.jpg.asset.json";
import chatbotAsset from "@/assets/Chatbot2.png.asset.json";

export const Route = createFileRoute("/chat/$botId/")({
  component: BotEntry,
});

function BotEntry() {
  const { botId } = Route.useParams();
  const navigate = useNavigate();
  const ran = useRef(false);
  const [loading, setLoading] = useState(false);

  const startThread = () => {
    if (ran.current) return;
    ran.current = true;
    setLoading(true);
    const sessionId = getSessionId();
    createThread({ data: { sessionId, botId } })
      .then((row) => {
        navigate({
          to: "/chat/$botId/$threadId",
          params: { botId, threadId: row.id },
          replace: true,
        });
      })
      .catch((e) => {
        console.error(e);
        ran.current = false;
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!isBotId(botId)) return;
    if (botId === "viden") return; // show welcome screen
    startThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  if (botId === "viden" && isBotId(botId)) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <section className="bg-white">
          <div className="w-full">
            <img
              src={videnHeroAsset.url}
              alt="Workshop om arbejdsmiljø"
              className="h-56 w-full object-cover sm:h-72 md:h-96"
            />
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
          <div
            className="relative p-6 sm:p-8"
            style={{
              borderRadius: "25px",
              background: "linear-gradient(180deg, #0C6B3B 0%, #17D173 100%)",
            }}
          >
            <div className="flex gap-4 sm:gap-6">
              <img
                src={chatbotAsset.url}
                alt="AI assistent"
                className="h-20 w-20 shrink-0 object-contain sm:h-24 sm:w-24"
              />
              <p className="text-sm leading-relaxed text-white sm:text-base">
                Hej og velkommen til AI assistenten "Viden om Arbejdsmiljø" Jeg er en digital assistent der hjælper dig med at finde brugbart materiale på de tre officielle hjemmesider, for Arbejdstilsynet,{" "}
                <a href="https://at.dk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#58D500" }}>at.dk</a>
                , Nationalt Forskningscenter for Arbejdsmiljø,{" "}
                <a href="https://nfa.dk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#58D500" }}>nfa.dk</a>
                {" "}og for Branchefællesskaberne for Arbejdsmiljø{" "}
                <a href="https://bfa-web.dk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#58D500" }}>bfa-web.dk</a>
                . Har du brug for råd og vejledning, så tøv ikke med at kontakte os på info@adweyse.dk eller søg mere information på{" "}
                <a href="https://www.AdWeyse.dk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#58D500" }}>www.AdWeyse.dk</a>
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={startThread}
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  borderRadius: "16px",
                  background: "#F78D0B",
                  color: "#000000",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                }}
              >
                {loading ? "Starter…" : "Søg materiale"}
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-6 px-4 pb-10 sm:px-6">
          <h2 className="text-2xl font-semibold" style={{ color: "#000000" }}>
            Branchefællesskaberne for Arbejdsmiljø (BFA)
          </h2>
          <p className="text-sm leading-relaxed sm:text-base" style={{ color: "#000000" }}>
            BrancheFællesskaberne for Arbejdsmiljø understøtter arbejdsmiljøarbejdet på arbejdspladserne med information og vejledning om arbejdsmiljø ved blandt andet at lave vejledninger, konferencer og uddannelse.
            De fem BrancheFællesskaber for Arbejdsmiljø (BFA) består af repræsentanter for arbejdsmarkedets parter.
            Undersøg hvilke(n) BFA, som dækker din branche eller på din arbejdsplads.
          </p>
        </section>

        <SiteFooter />
          <div
            className="flex items-start gap-4 p-5 sm:gap-6 sm:p-6"
            style={{
              borderRadius: "16px",
              background: "#0C6B3B",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white sm:h-24 sm:w-24">
              <span className="text-xl font-bold text-[#0C6B3B] sm:text-2xl">AT</span>
            </div>
            <div className="text-sm leading-relaxed sm:text-base">
              <h3 className="mb-1 text-lg font-semibold">Arbejdstilsynet</h3>
              <p>
                Arbejdstilsynet er den danske myndighed, der kontrollerer og vejleder virksomheder om arbejdsmiljø for at sørge for, at vi har sikre og sunde arbejdspladser i hele Danmark. Deres hjemmeside opdateres sig løbende og præsenterer den nyeste viden inden for arbejdsmiljø. Se f.eks. på et tema og se hvordan Arbejdstilsynet forholder sig til det område.
              </p>
              <p className="mt-2">
                <span className="font-semibold">Link</span>{" "}
                <a
                  href="https://at.dk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline"
                  style={{ color: "#58D500" }}
                >
                  https://at.dk/
                </a>
              </p>
            </div>
          </div>

          <div
            className="flex items-start gap-4 p-5 sm:gap-6 sm:p-6"
            style={{
              borderRadius: "16px",
              background: "#0C6B3B",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-white sm:h-24 sm:w-24">
              <span className="text-xl font-bold text-[#0C6B3B] sm:text-2xl">NFA</span>
            </div>
            <div className="text-sm leading-relaxed sm:text-base">
              <h3 className="mb-1 text-lg font-semibold">NFA</h3>
              <p>
                NFA er en uafhængig sektorforskningsinstitution under Beskæftigelsesministeriet (BM) og den største forskningsinstitution på arbejdsmiljøområdet i Danmark.
              </p>
              <p className="mt-2">
                <span className="font-semibold">Link</span>{" "}
                <a
                  href="https://nfa.dk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline"
                  style={{ color: "#58D500" }}
                >
                  https://nfa.dk/
                </a>
              </p>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    );

  }

  return (
    <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
      Starter samtale…
    </div>
  );
}
