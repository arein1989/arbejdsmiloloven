import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { isBotId } from "@/lib/bots";
import { createThread } from "@/lib/chat.functions";
import { getSessionId } from "@/lib/session";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BfaLogo } from "@/components/BfaLogo";
import videnHeroAsset from "@/assets/arbejdsmiljøloven.jpg.asset.json";
import chatbotAsset from "@/assets/Chatbot2.png.asset.json";
import atLogoAsset from "@/assets/arbejdstilsynet-logo.png.asset.json";
import nfaLogoAsset from "@/assets/nfa-logo.png.asset.json";

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
    if (botId === "viden" || botId === "regler") return; // show welcome screen
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

        {/* Info boxes */}
        <section className="mx-auto max-w-4xl space-y-6 px-4 pb-10 sm:px-6">
          <div
            className="flex min-h-[180px] items-start gap-4 p-5 sm:gap-6 sm:p-6"
            style={{
              borderRadius: "16px",
              background: "#0C6B3B",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg bg-white p-2 sm:h-28 sm:w-36">
              <img src={atLogoAsset.url} alt="Arbejdstilsynet" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex-1 text-sm leading-relaxed sm:text-base">
              <h4 className="mb-1 text-lg font-semibold">Arbejdstilsynet</h4>
              <p>
                Arbejdstilsynet er den danske myndighed, der kontrollerer og vejleder virksomheder om arbejdsmiljø for at sørge for, at vi har sikre og sunde arbejdspladser i hele Danmark. Deres hjemmeside opdateres sig løbende og præsenterer den nyeste viden inden for arbejdsmiljø. Se f.eks. på et tema og se hvordan Arbejdstilsynet forholder sig til det område.
              </p>
              <div className="mt-2">
                <h4 className="inline text-base font-semibold">Link</h4>{" "}
                <a
                  href="https://at.dk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline"
                  style={{ color: "#58D500" }}
                >
                  https://at.dk/
                </a>
              </div>
            </div>
          </div>

          <div
            className="flex min-h-[180px] items-start gap-4 p-5 sm:gap-6 sm:p-6"
            style={{
              borderRadius: "16px",
              background: "#0C6B3B",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-lg bg-white p-2 sm:h-28 sm:w-36">
              <img src={nfaLogoAsset.url} alt="NFA" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="flex-1 text-sm leading-relaxed sm:text-base">
              <h4 className="mb-1 text-lg font-semibold">NFA</h4>
              <p>
                NFA er en uafhængig sektorforskningsinstitution under Beskæftigelsesministeriet (BM) og den største forskningsinstitution på arbejdsmiljøområdet i Danmark.
              </p>
              <div className="mt-2">
                <h4 className="inline text-base font-semibold">Link</h4>{" "}
                <a
                  href="https://nfa.dk/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 underline"
                  style={{ color: "#58D500" }}
                >
                  https://nfa.dk/
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-4 px-4 pb-10 sm:px-6">
          <h2 className="text-2xl font-semibold" style={{ color: "#000000" }}>
            Branchefællesskaberne for Arbejdsmiljø (BFA)
          </h2>
          <p className="text-sm leading-relaxed sm:text-base" style={{ color: "#000000" }}>
            BrancheFællesskaberne for Arbejdsmiljø understøtter arbejdsmiljøarbejdet på arbejdspladserne med information og vejledning om arbejdsmiljø ved blandt andet at lave vejledninger, konferencer og uddannelse.
            De fem BrancheFællesskaber for Arbejdsmiljø (BFA) består af repræsentanter for arbejdsmarkedets parter.
            Undersøg hvilke(n) BFA, som dækker din branche eller på din arbejdsplads.
          </p>
        </section>

        <section className="mx-auto max-w-4xl space-y-5 px-4 pb-10 sm:px-6">
          {[
            {
              title: "Velfærd og Offentlig administration",
              url: "https://www.godtarbejdsmiljo.dk/",
            },
            {
              title: "Bygge & anlæg",
              url: "https://bfa-ba.dk/",
            },
            {
              title: "Handel, Finans og Kontor",
              url: "https://www.bfa-hfk.dk/",
            },
            {
              title: "Transport, service og Turisme, samt jord til bord",
              url: "https://www.handelfinanskontor.dk/",
            },
            {
              title: "BFA Portalen",
              url: "https://www.bfaportalen.dk/",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="overflow-hidden"
              style={{
                backgroundColor: "#0C6B3B",
                borderRadius: "16px",
                color: "#ffffff",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
              }}
            >
              <div className="flex items-start gap-4 p-5 sm:gap-6 sm:p-6">
                <BfaLogo
                  name={item.title as ComponentProps<typeof BfaLogo>["name"]}
                  className="h-16 w-16 shrink-0 sm:h-20 sm:w-20"
                />
                <div className="flex-1">
                  <h4 className="text-base font-semibold sm:text-lg">{item.title}</h4>
                  <div className="mt-2 text-sm leading-relaxed sm:text-base">
                    <h4 className="inline text-sm font-semibold sm:text-base">Link</h4>{" "}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "#58D500" }}
                    >
                      {item.url}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-4xl space-y-4 px-4 pb-10 sm:px-6">
          <h2 className="text-2xl font-semibold" style={{ color: "#000000" }}>
            Andre Links
          </h2>
          <div
            className="overflow-hidden"
            style={{
              backgroundColor: "#0C6B3B",
              borderRadius: "16px",
              color: "#ffffff",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            }}
          >
            <div className="flex items-center gap-4 p-5 sm:gap-6 sm:p-6">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
              >
                <Link2 className="h-6 w-6" style={{ color: "#ffffff" }} />
              </div>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed sm:text-base">
                <li>
                  <a href="https://www.retsinformation.dk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#ffffff" }}>
                    retsinformation.dk
                  </a>
                </li>
                <li>
                  <a href="https://osha.europa.eu/da" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#ffffff" }}>
                    osha.europa.eu/da
                  </a>
                </li>
                <li>
                  <a href="https://www.arbejdsmedicinsk.dk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#ffffff" }}>
                    arbejdsmedicinske klinikker
                  </a>
                </li>
                <li>
                  <a href="https://www.arbejdsmiljoklagenavnet.dk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#ffffff" }}>
                    arbejdsmiljøklagenævnet
                  </a>
                </li>
                <li>
                  <a href="https://www.aes.dk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#ffffff" }}>
                    arbejdsmarkedets erhvervssikring
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    );

  }

  if (botId === "regler" && isBotId(botId)) {
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

        <section className="mx-auto max-w-4xl space-y-4 px-4 pt-10 sm:px-6">
          <h1 className="text-3xl font-semibold" style={{ color: "#000000" }}>
            Lov om arbejdsmiljø, bekendtgørelser og AT-vejledninger
          </h1>
          <p className="text-sm leading-relaxed sm:text-base" style={{ color: "#000000" }}>
            Arbejdsmiljøloven er en såkaldt rammelov. Den sætter sammen med hoved-bekendtgørelserne rammen for arbejdsmiljøet i Danmark.
          </p>
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
                Hej og velkommen til AI assistenten "Regelfinder". Jeg er en digital juridisk assistent, der hjælper dig med at finde præcis den bekendtgørelse, paragraf eller AT-vejledning du leder efter. Har du brug for råd og vejledning, så tøv ikke med at kontakte os på{" "}
                <a href="mailto:info@adweyse.dk" className="underline" style={{ color: "#58D500" }}>info@adweyse.dk</a>
                {" "}eller søg mere information på{" "}
                <a href="https://www.AdWeyse.dk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#58D500" }}>www.AdWeyse.dk</a>
                .
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
                {loading ? "Starter…" : "Søg regler"}
              </button>
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
