import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Link2 } from "lucide-react";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
import arrowDownFilledAsset from "@/assets/arrow-down-filled.png.asset.json";


function LawSection({ title, description, children, defaultOpen = false }: { title: string; description: ReactNode; children?: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-start gap-2 py-0 text-left cursor-pointer hover:no-underline">
          <h3 className="text-xl font-semibold" style={{ color: "#000000" }}>
            {title}
          </h3>
          <img
            src={arrowDownFilledAsset.url}
            alt=""
            className={`h-5 w-6 shrink-0 object-contain transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </CollapsibleTrigger>
        <p className="mt-1 text-sm leading-relaxed sm:text-base" style={{ color: "#000000" }}>
          {description}
        </p>
        {children ? (
          <CollapsibleContent>
            <div
              className="mt-2 p-4 sm:p-5"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #007A4F",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
              }}
            >
              {children}
            </div>
          </CollapsibleContent>
        ) : null}
      </Collapsible>
    </div>
  );
}

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
    if (botId === "viden" || botId === "regler" || botId === "problem") return; // show welcome screen
    startThread();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botId]);

  if (botId === "problem" && isBotId(botId)) {
    return (
      <div className="min-h-screen bg-white">
        <SiteHeader />
        <section className="bg-white">
          <div className="w-full">
            <img
              src={videnHeroAsset.url}
              alt="Konference om arbejdsmiljø"
              className="h-56 w-full object-cover sm:h-72 md:h-96"
            />
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-4 px-4 pt-10 sm:px-6">
          <h1 className="text-3xl font-semibold" style={{ color: "#000000" }}>
            Få svar på dit arbejdsmiljøspørgsmål
          </h1>
          <p className="text-sm leading-relaxed sm:text-base" style={{ color: "#000000" }}>
            Arbejdsmiljøloven.dk
            <br />
            Skabt til at løfte arbejdsmiljøarbejdet til nye højder.
            <br />
            Mangler du{" "}
            <a
              href="https://www.arbejdsmiljøuddannelse.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
              style={{ color: "#0C6B3B" }}
            >
              "Den lovpligtige arbejdsmiljøuddannelse"
            </a>
            ? Så find en tæt på dig på{" "}
            <a
              href="https://www.arbejdsmiljøuddannelse.dk"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline"
              style={{ color: "#0C6B3B" }}
            >
              www.arbejdsmiljøuddannelse.dk
            </a>
          </p>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <div
            className="p-5 sm:p-6"
            style={{
              backgroundColor: "#8CC63E",
              border: "1px solid #000000",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.6)",
              color: "#000000",
            }}
          >
            <h3 className="text-lg font-semibold sm:text-xl" style={{ color: "#000000" }}>
              Anbefaling
            </h3>
            <h4 className="mt-3 text-base font-semibold sm:text-lg" style={{ color: "#000000" }}>
              Opret en mappe til dine arbejdsmiljødokumenter
            </h4>
            <p className="mt-2 text-sm leading-relaxed sm:text-base" style={{ color: "#000000" }}>
              Det at gemme profiler på en hjemmeside kan kræve en større databehandling, så på grund af GDPR, er vi ikke der endnu. Det arbejder vi på.
              <br />
              Derfor anbefaler vi, at du opretter en mappe på din computer eller telefon, hvor du kan gemme dine vigtigste dokumenter såsom bekendtgørelser, AT‑vejledninger, BFA‑materiale og andre relevante filer. Det giver dig et samlet og let tilgængeligt overblik, når du arbejder med arbejdsmiljøet.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-12 sm:px-6">
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
                Hej og velkommen til AI assistenten "Arbejdsmiljøloven"
                <br />
                Jeg er en digital assistent, der hjælper dig med at finde svar på spørgsmål indenfor arbejdsmiljø. Jeg søger kun svar i gældende arbejdsmiljølove, bekendtgørelser og AT-vejledninger, som er udgivet på retsinformation, og som I kan finde på næste side. Har I brug brug for rådgivning, eller anden hjælp til jeres arbejdsmiljøudfordringer, så kontakt os på{" "}
                <a href="mailto:info@adweyse.dk" className="underline" style={{ color: "#58D500" }}>
                  info@adweyse.dk
                </a>
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
                {loading ? "Starter…" : "Stil dine spørgsmål her"}
              </button>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    );
  }


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
              url: "https://bfahandelfinanskontor.dk/",
            },
            {
              title: "Transport, service og Turisme, samt jord til bord",
              url: "https://bfaportalen.dk/",
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
                  <a href="https://www.ast.dk/naevn/arbejdsmiljoeklagenaevnet" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#ffffff" }}>
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
                Hej og velkommen til AI assistenten "Regelfinder". Jeg er en digital assistent, der hjælper dig med at finde en bestemt bekendtgørelse eller en bestemt AT-vejledning.
                <br /><br />
                Skal I på "Den Lovpligtige Arbejdsmiljøuddannelse", på en supplerende arbejdsmiljøuddannelse eller på "Arbejdsmiljøkoordinatoruddannelsen" så find en uddannelse eller kursus på{" "}
                <a href="https://www.arbejdsmiljøuddannelse.dk" target="_blank" rel="noopener noreferrer" className="underline" style={{ color: "#58D500" }}>www.arbejdsmiljøuddannelse.dk</a>
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
                {loading ? "Starter…" : "Søg efter regler"}
              </button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-4xl space-y-4 px-4 pb-10 sm:px-6">
          <LawSection
            title="Lov om arbejdsmiljø og hoved-bekendtgørelserne"
            description={
              <>
                Denne liste består af arbejdsmiljøloven, men også de bekendtgørelser som er såkaldte hovedbekendtgørelser og som dermed er med til at sætte rammen for arbejdsmiljøarbejdet. Endelig består den også af de mest benyttede og vigtige bekendtgørelser. Mangler der for jer at se vigtige bekendtgørelser på denne liste, så tøv ikke med at skrive til os på{" "}
                <a href="mailto:info@adweyse.dk" className="underline" style={{ color: "#0C6B3B" }}>info@adweyse.dk</a>
                {" "}og begrund hvorfor en bestemt bekendtgørelse skal med på denne liste.
              </>
            }
            defaultOpen
          >
            <div className="space-y-5" style={{ color: "#000000" }}>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed sm:text-base">
                <li>
                  <a
                    href="https://www.retsinformation.dk/eli/lta/2026/442"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                    style={{ color: "#0C6B3B" }}
                  >
                    Lovbekendtgørelse nr. 442 af 24/04/2026 - Lov om arbejdsmiljø
                  </a>
                </li>
                {[
                  { label: "Bekendtgørelse nr. 65 af 22/01/2024 - Systematisk arbejdsmiljøarbejde", url: "https://www.retsinformation.dk/eli/lta/2024/65" },
                  { label: "Bekendtgørelse nr. 1839 af 14/12/2023 - Arbejdets udførelse", url: "https://www.retsinformation.dk/eli/lta/2023/1839" },
                  { label: "Bekendtgørelse nr. 1406 af 26/09/2020 - Psykisk arbejdsmiljø", url: "https://www.retsinformation.dk/eli/lta/2020/1406" },
                  { label: "Bekendtgørelse nr. 835 af 16/06/2023 - Faste arbejdssteders indretning", url: "https://www.retsinformation.dk/eli/lta/2023/835" },
                  { label: "Bekendtgørelse nr. 290 af 05/05/1993 - Skiftende arbejdssteders indretning", url: "https://www.retsinformation.dk/eli/lta/1993/290", note: " (Denne har en alder som gør den ikke kan laves i en pdf på Arbejdstilsynets hjemmeside, så den skal vi selv producere)" },
                  { label: "Bekendtgørelse nr. 428 af 05/04/2022 - Anvendelse af tekniske hjælpemidler", url: "https://www.retsinformation.dk/eli/lta/2022/428" },
                  { label: "Bekendtgørelse nr. 429 af 05/04/2022 - Indretning af tekniske hjælpemidler", url: "https://www.retsinformation.dk/eli/lta/2022/429" },
                  { label: "Bekendtgørelse nr. 381 af 12/04/2023 - Arbejde med stoffer og materialer", url: "https://www.retsinformation.dk/eli/lta/2023/381" },
                  { label: "Bekendtgørelse nr. 1713 af 18/12/2025 - Unges arbejde", url: "https://www.retsinformation.dk/eli/lta/2025/1713" },
                  { label: "Bekendtgørelse nr. 324 af 23/05/2002 - Hvileperiode og fridøgn", url: "https://www.retsinformation.dk/eli/lta/2002/324", note: " (Denne har en alder som gør den ikke kan laves i en pdf på Arbejdstilsynets hjemmeside, så den skal vi selv producere)" },
                  { label: "Bekendtgørelse nr. 2107 af 24/11/2021 - Bygge- og anlægsarbejde", url: "https://www.retsinformation.dk/eli/lta/2021/2107" },
                  { label: "Bekendtgørelse nr. 117 af 05/02/2013 - Bygherrens pligter", url: "https://www.retsinformation.dk/eli/lta/2013/117" },
                  { label: "Bekendtgørelse nr. 110 af 05/02/2013 - Projekterendes og rådgiveres pligter", url: "https://www.retsinformation.dk/eli/lta/2013/110" },
                ].map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "#0C6B3B" }}
                    >
                      {item.label}
                    </a>
                    {item.note ? <strong>{item.note}</strong> : null}
                  </li>
                ))}
              </ul>
            </div>
          </LawSection>

          <LawSection
            title="Bekendtgørelser"
            description="En bekendtgørelse er de bindende regler på arbejdsmiljøområdet. En bekendtgørelse har samme betydning som arbejdsmiljøloven, men de er ofte mere detaljeret og forklarende end arbejdsmiljøloven og hoved-bekendtgørelserne."
          >
            <div className="space-y-5" style={{ color: "#000000" }}>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed sm:text-base">
                {[
                  { label: "Bekendtgørelse nr. 594 af 2026 - Adgangsveje til elevatorer, rulletrapper og lignende maskiner", url: "https://www.retsinformation.dk/eli/lta/2026/594" },
                  { label: "Bekendtgørelse nr. 1295 af 2021 - Anerkendelse af erhvervsmæssige kvalifikationer erhvervet i udlandet", url: "https://www.retsinformation.dk/eli/lta/2021/1295" },
                  { label: "Bekendtgørelse nr. 565 af 2026 - Anmeldelse af arbejdsulykker m.v. til Arbejdstilsynet", url: "https://www.retsinformation.dk/eli/lta/2026/565" },
                  { label: "Bekendtgørelse nr. 564 af 2026 - Anmeldelse af ulykker efter arbejdsskadesikringsloven", url: "https://www.retsinformation.dk/eli/lta/2026/564" },
                  { label: "Bekendtgørelse nr. 2162 af 2020 - Anmeldelsespligt til Registret for Udenlandske Tjenesteydere (RUT) for selvstændigt erhvervsdrivende uden ansatte", url: "https://www.retsinformation.dk/eli/lta/2020/2162" },
                  { label: "Bekendtgørelse nr. 295 af 2026 - Anvendelse af administrativt bødeforelæg ved overtrædelse af arbejdsmiljølovgivningen", url: "https://www.retsinformation.dk/eli/lta/2026/295" },
                  { label: "Bekendtgørelse nr. 612 af 2026 - Anvendelse af personlige værnemidler", url: "https://www.retsinformation.dk/eli/lta/2026/612" },
                  { label: "Bekendtgørelse nr. 428 af 2022 - Anvendelse af tekniske hjælpemidler", url: "https://www.retsinformation.dk/eli/lta/2022/428" },
                  { label: "Bekendtgørelse nr. 498 af 2024 - Anvendelse af trykbærende udstyr", url: "https://www.retsinformation.dk/eli/lta/2024/498" },
                  { label: "Bekendtgørelse nr. 461 af 2016 - Anvendelse m.v. af elevatorer, rulletrapper og lignende maskiner", url: "https://www.retsinformation.dk/eli/lta/2016/461" },
                  { label: "Bekendtgørelse nr. 478 af 2003 - Arbejde i forbindelse med eksplosiv atmosfære", url: "https://www.retsinformation.dk/eli/lta/2003/478" },
                  { label: "Bekendtgørelse nr. 302 af 1993 - Arbejde med kodenummererede produkter", url: "https://www.retsinformation.dk/eli/lta/1993/302" },
                  { label: "Bekendtgørelse nr. 1399 af 2021 - Arbejde med montering og nedrivning af isoleringsmaterialer med indhold af syntetiske mineralfibre", url: "https://www.retsinformation.dk/eli/lta/2021/1399" },
                  { label: "Bekendtgørelse nr. 581 af 2026 - Arbejde med stoffer og materialer (kemiske agenser)", url: "https://www.retsinformation.dk/eli/lta/2026/581" },
                  { label: "Bekendtgørelse nr. 603 af 2026 - Arbejde med udvinding af mineralske materialer", url: "https://www.retsinformation.dk/eli/lta/2026/603" },
                  { label: "Bekendtgørelse nr. 1108 af 1992 - Arbejde ved skærmterminaler", url: "https://www.retsinformation.dk/eli/lta/1992/1108" },
                  { label: "Bekendtgørelse nr. 609 af 2026 - Arbejdets udførelse", url: "https://www.retsinformation.dk/eli/lta/2026/609" },
                  { label: "Bekendtgørelse nr. 1165 af 1992 - Arbejdsmedicinske undersøgelser efter lov om arbejdsmiljø", url: "https://www.retsinformation.dk/eli/lta/1992/1165" },
                  { label: "Bekendtgørelse nr. 1978 af 2021 - Arbejdsmiljøfaglige uddannelser", url: "https://www.retsinformation.dk/eli/lta/2021/1978" },
                  { label: "Bekendtgørelse nr. 599 af 2026 - Arbejdsrelateret vold uden for arbejdstid", url: "https://www.retsinformation.dk/eli/lta/2026/599" },
                  { label: "Bekendtgørelse nr. 133 af 2017 - Arbejdstilsynets undersøgelse af udenlandske virksomheders reelle etablering", url: "https://www.retsinformation.dk/eli/lta/2017/133" },
                  { label: "Bekendtgørelse nr. 986 af 2018 - Arbejdstilsynets videregivelse af oplysninger om virksomheder, som er pålagt anmeldelse i Registret for Udenlandske Tjenesteydere (RUT)", url: "https://www.retsinformation.dk/eli/lta/2018/986" },
                  { label: "Bekendtgørelse nr. 1328 af 2025 - Asbest i arbejdsmiljøet", url: "https://www.retsinformation.dk/eli/lta/2025/1328" },
                  { label: "Bekendtgørelse nr. 1867 af 2023 - Autorisation af rådgivningsvirksomheder på arbejdsmiljøområdet", url: "https://www.retsinformation.dk/eli/lta/2023/1867" },
                  { label: "Bekendtgørelse nr. 723 af 2024 - Autorisation og godkendelse af fagligt ansvarlige på asbestområdet", url: "https://www.retsinformation.dk/eli/lta/2024/723" },
                  { label: "Bekendtgørelse nr. 1410 af 2020 - Begrænsning af Arbejdstilsynets tilsyn med overholdelse af visse arbejdsmiljøregler", url: "https://www.retsinformation.dk/eli/lta/2020/1410" },
                  { label: "Bekendtgørelse nr. 597 af 2026 - Begrænsninger i anvendelsen af lov om arbejdsmiljø på arbejde, som udføres i den ansattes hjem", url: "https://www.retsinformation.dk/eli/lta/2026/597" },
                  { label: "Bekendtgørelse nr. 562 af 2010 - Beskyttelse mod udsættelse for kunstig optisk stråling i forbindelse med arbejdet", url: "https://www.retsinformation.dk/eli/lta/2010/562" },
                  { label: "Bekendtgørelse nr. 63 af 2006 - Beskyttelse mod udsættelse for støj i forbindelse med arbejdet", url: "https://www.retsinformation.dk/eli/lta/2006/63" },
                  { label: "Bekendtgørelse nr. 682 af 2005 - Beskyttelse mod udsættelse for vibrationer ifm. Arbejdet", url: "https://www.retsinformation.dk/eli/lta/2005/682" },
                  { label: "Bekendtgørelse nr. 1270 af 2024 - Biologiske agenser og arbejdsmiljø", url: "https://www.retsinformation.dk/eli/lta/2024/1270" },
                  { label: "Bekendtgørelse nr. 209 af 2025 - Branchefællesskaber for arbejdsmiljø", url: "https://www.retsinformation.dk/eli/lta/2025/209" },
                  { label: "Bekendtgørelse nr. 2107 af 2021 - Bygge- og anlægsarbejde", url: "https://www.retsinformation.dk/eli/lta/2021/2107" },
                  { label: "Bekendtgørelse nr. 117 af 2013 - Bygherrens pligter", url: "https://www.retsinformation.dk/eli/lta/2013/117" },
                  { label: "Bekendtgørelse nr. 1076 af 2011 - Delegation til Miljøstyrelsen af opgaver efter lov om arbejdsmiljø vedrørende periodisk funktionskontrol af pesticidudbringningsudstyr i henhold til Europa-Parlamentets og Rådets direktiv 2009/128/EF", url: "https://www.retsinformation.dk/eli/lta/2011/1076" },
                  { label: "Bekendtgørelse nr. 708 af 2024 - Den fagligt ansvarliges kvalifikationer og uddannelse under autorisationsordning for nedrivning af asbestholdigt materiale", url: "https://www.retsinformation.dk/eli/lta/2024/708" },
                  { label: "Bekendtgørelse nr. 475 af 1975 - EF-direktiver om landbrugs- og   skovbrugshjultraktorer", url: "https://www.retsinformation.dk/eli/lta/1975/475" },
                  { label: "Bekendtgørelse nr. 564 af 1997 - EF-direktiver om trykbeholdere", url: "https://www.retsinformation.dk/eli/lta/1997/564" },
                  { label: "Bekendtgørelse nr. 472 af 2016 - Eksponering for elektromagnetiske felter i forbindelse med arbejdet", url: "https://www.retsinformation.dk/eli/lta/2016/472" },
                  { label: "Bekendtgørelse nr. 607 af 2026 - Faste arbejdssteders indretning", url: "https://www.retsinformation.dk/eli/lta/2026/607" },
                  { label: "Bekendtgørelse nr. 301 af 1993 - Fastsættelse af kodenumre", url: "https://www.retsinformation.dk/eli/lta/1993/301" },
                  { label: "Bekendtgørelse nr. 582 af 2026 - Foranstaltninger til forebyggelse af risikoen ved arbejde med kræftfremkaldende, mutagene eller reproduktionstoksiske stoffer og materialer", url: "https://www.retsinformation.dk/eli/lta/2026/582" },
                  { label: "Bekendtgørelse nr. 25 af 2026 - Forretningsorden for Arbejdsmiljøklagenævnet", url: "https://www.retsinformation.dk/eli/lta/2026/25" },
                  { label: "Bekendtgørelse nr. 601 af 2026 - Genteknologi og arbejdsmiljø", url: "https://www.retsinformation.dk/eli/lta/2026/601" },
                  { label: "Bekendtgørelse nr. 348 af 2026 - Godkendelse af udbydere af de obligatoriske arbejdsmiljøuddannelser", url: "https://www.retsinformation.dk/eli/lta/2026/348" },
                  { label: "Bekendtgørelse nr. 613 af 2026 - Grænseværdier for stoffer og materialer (kemiske agenser) i arbejdsmiljøet", url: "https://www.retsinformation.dk/eli/lta/2026/613" },
                  { label: "Bekendtgørelse nr. 606 af 2026 - Hvileperiode og fridøgn", url: "https://www.retsinformation.dk/eli/lta/2026/606" },
                  { label: "Bekendtgørelse nr. 604 af 2026 - Indretning af skurvogne og lignende", url: "https://www.retsinformation.dk/eli/lta/2026/604" },
                  { label: "Bekendtgørelse nr. 595 af 2026 - Indretning af tekniske hjælpemidler", url: "https://www.retsinformation.dk/eli/lta/2026/595" },
                  { label: "Bekendtgørelse nr. 99 af 2007 - Indretning, ombygning og reparation af trykbærende udstyr", url: "https://www.retsinformation.dk/eli/lta/2007/99" },
                  { label: "Bekendtgørelse nr. 1448 af 2021 - Indretningskrav til eksisterende elevatorer m.v., der ikke er CE-mærket", url: "https://www.retsinformation.dk/eli/lta/2021/1448" },
                  { label: "Bekendtgørelse nr. 358 af 1974 - Internt sikkerhedsarbejde ved bygge- og anlægsarbejde", url: "https://www.retsinformation.dk/eli/lta/1974/358" },
                  { label: "Bekendtgørelse nr. 473 af 1983 - Kloakarbejde m.v", url: "https://www.retsinformation.dk/eli/lta/1983/473" },
                  { label: "Bekendtgørelse nr. 600 af 2026 - Kontrol med arbejdsmiljøet ved risiko for større uheld med farlige stoffer", url: "https://www.retsinformation.dk/eli/lta/2026/600" },
                  { label: "Bekendtgørelse nr. 372 af 2016 - Kontrol med risikoen for større uheld med farlige stoffer", url: "https://www.retsinformation.dk/eli/lta/2016/372" },
                  { label: "Bekendtgørelse nr. 70 af 1980 - Konvention om sikre containere", url: "https://www.retsinformation.dk/eli/lta/1980/70" },
                  { label: "Bekendtgørelse nr. 1445 af 2024 - Lov om indkvartering af ansatte (Lov 1445)", url: "https://www.retsinformation.dk/eli/lta/2024/1445" },
                  { label: "Bekendtgørelse nr. 681 af 2026 - Lov om udstationering af lønmodtagere m.v. (LBK 681)", url: "https://www.retsinformation.dk/eli/lta/2026/681" },
                  { label: "Bekendtgørelse nr. 486 af 2024 - Lægers og tandlægers pligt til at anmelde erhvervssygdomme til Arbejdstilsynet og Arbejdsmarkedets Erhvervssikring", url: "https://www.retsinformation.dk/eli/lta/2024/486" },
                  { label: "Bekendtgørelse nr. 598 af 2026 - Lægeundersøgelser ved arbejde, der kan medføre ioniserende stråling", url: "https://www.retsinformation.dk/eli/lta/2026/598" },
                  { label: "Bekendtgørelse nr. 1164 af 1992 - Manuel håndtering", url: "https://www.retsinformation.dk/eli/lta/1992/1164" },
                  { label: "Bekendtgørelse nr. 1203 af 2017 - Obligatorisk digital kommunikation til Arbejdstilsynet", url: "https://www.retsinformation.dk/eli/lta/2017/1203" },
                  { label: "Bekendtgørelse nr. 611 af 2026 - Offentliggørelse af oplysninger om virksomheders arbejdsmiljø", url: "https://www.retsinformation.dk/eli/lta/2026/611" },
                  { label: "Bekendtgørelse nr. 1997 af 2020 - Ombygning og væsentlig reparation af elevatorer m.v", url: "https://www.retsinformation.dk/eli/lta/2020/1997" },
                  { label: "Bekendtgørelse nr. 1994 af 2020 - Pligter efter lov om arbejdsmiljø i forbindelse med udbud af tjenesteydelser", url: "https://www.retsinformation.dk/eli/lta/2020/1994" },
                  { label: "Bekendtgørelse nr. 103 af 2018 - Produktregistret", url: "https://www.retsinformation.dk/eli/lta/2018/103" },
                  { label: "Bekendtgørelse nr. 110 af 2013 - Projekterendes og rådgiveres pligter m.v. efter lov om arbejdsmiljø", url: "https://www.retsinformation.dk/eli/lta/2013/110" },
                  { label: "Bekendtgørelse nr. 605 af 2026 - Psykisk arbejdsmiljø", url: "https://www.retsinformation.dk/eli/lta/2026/605" },
                  { label: "Bekendtgørelse nr. 1842 af 2023 - Påbud om undersøgelse af det psykiske arbejdsmiljø", url: "https://www.retsinformation.dk/eli/lta/2023/1842" },
                  { label: "Bekendtgørelse nr. 579 af 1987 - Registret for genteknologi", url: "https://www.retsinformation.dk/eli/lta/1987/579" },
                  { label: "Bekendtgørelse nr. 611 af 1985 - Regler efter den tidligere arbejderbeskyttelseslovgivning, der med mindre ændringer forbliver i kraft   efter arbejdsmiljølovens ikrafttræden (Ikraftholdelsesbekendtgørelsen) (* 1)", url: "https://www.retsinformation.dk/eli/lta/1985/611" },
                  { label: "Bekendtgørelse nr. 372 af 1965 - Regler for arbejde på fartøj med tank for olie m.v", url: "https://retsinformation.dk/eli/lta/1965/372" },
                  { label: "Bekendtgørelse nr. 181 af 1965 - Regulativ for lastning og losning af skibe", url: "https://www.retsinformation.dk/eli/lta/1965/181" },
                  { label: "Bekendtgørelse nr. 518 af 1994 - Sikkerhedsskiltning og signalgivning og anden form for signalgivning", url: "https://www.retsinformation.dk/eli/lta/1994/518" },
                  { label: "Bekendtgørelse nr. 618 af 2026 - Skiftende arbejdssteders indretning", url: "https://www.retsinformation.dk/eli/lta/2026/618" },
                  { label: "Bekendtgørelse nr. 608 af 2026 - Systematisk arbejdsmiljøarbejde", url: "https://www.retsinformation.dk/eli/lta/2026/608" },
                  { label: "Bekendtgørelse nr. 1794 af 2015 - Særlige pligter for fremstillere, leverandører og importører m.v. af stoffer og materialer efter lov om arbejdsmiljø", url: "https://www.retsinformation.dk/eli/lta/2015/1794" },
                  { label: "Bekendtgørelse nr. 688 af 2025 - Tilsyn med og offentliggørelse af oplysninger om virksomheder med anerkendt arbejdsmiljøcertifikat efter ISO 45001", url: "https://www.retsinformation.dk/eli/lta/2025/688" },
                  { label: "Bekendtgørelse nr. 289 af 2001 - Transportabelt trykbærende udstyr", url: "https://www.retsinformation.dk/eli/lta/2001/289" },
                  { label: "Bekendtgørelse nr. 610 af 2026 - Udstedelse af administrative bødeforelæg for visse overtrædelser af anmeldepligten til Registret for Udenlandske Tjenesteydere (RUT)", url: "https://www.retsinformation.dk/eli/lta/2026/610" },
                  { label: "Bekendtgørelse nr. 799 af 2013 - Udvidelse af pligten for tjenesteydere og hvervgivere til at sikre anmeldelse til Registret for Udenlandske Tjenesteydere (RUT)", url: "https://www.retsinformation.dk/eli/lta/2013/799" },
                  { label: "Bekendtgørelse nr. 1727 af 2023 - Underretning af Arbejdsmarkedets Erhvervssikring om visse kræftformer, der kan være erhvervsbetingede", url: "https://www.retsinformation.dk/eli/lta/2023/1727" },
                  { label: "Bekendtgørelse nr. 1517 af 2010 - Undtagelser fra anmeldelsespligten til Registret for Udenlandske Tjenesteydere (RUT) (Kortvarige udstationeringer)", url: "https://www.retsinformation.dk/eli/lta/2010/1517" },
                  { label: "Bekendtgørelse nr. 1713 af 2025 - Unges arbejde", url: "https://www.retsinformation.dk/eli/lta/2025/1713" },
                  { label: "Bekendtgørelse nr. 517 af 2025 - Voldsskadeforsikring", url: "https://www.retsinformation.dk/eli/lta/2025/517" },
                  { label: "Bekendtgørelse nr. 773 af 2025 - Ændring af bekendtgørelse om arbejdsmiljøfaglige uddannelser", url: "https://www.retsinformation.dk/eli/lta/2025/773" },
                ].map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "#0C6B3B" }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </LawSection>

          <LawSection
            title="AT-vejledninger"
            description="En AT-vejledning er siden 15. december 2025 blevet såkaldte “juridiske dokumenter” som fokuserer på forklaringen af det retslige grundlag for arbejdsgiverne. En AT-vejledning kan dække mange bekendtgørelser og det der står i en AT-vejledning er nu lige så bindende som en bekendtgørelse."
          >
            <div className="space-y-5" style={{ color: "#000000" }}>
              <ul className="list-disc space-y-1 pl-5 text-sm leading-relaxed sm:text-base">
                {[
                  { label: "AT-vejledning om Arbejdsstedets indretning", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10207" },
                  { label: "AT-vejledning om Skærmarbejde", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10208" },
                  { label: "AT-vejledning om Systematisk arbejdsmiljøarbejde, herunder samarbejde om arbejdsmiljø", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10209" },
                  { label: "AT-vejledning om Psykisk arbejdsmiljø", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10217" },
                  { label: "AT-vejledning om Ergonomisk arbejdsmiljø", url: "https://www.retsinformation.dk/eli/retsinfo/2026/9207" },
                  { label: "AT-vejledning om Kemi og biologi i arbejdsmiljøet – udvalgte emner", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10210" },
                  { label: "AT-vejledning om Bygge- og anlægsarbejde", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10211" },
                  { label: "AT-vejledning om Bygherrens pligter", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10212" },
                  { label: "AT-vejledning om unges arbejde, elevers praktiske øvelser samt gravide og ammendes arbejde", url: "https://www.retsinformation.dk/eli/retsinfo/2026/9111" },
                  { label: "AT-vejledning om Pligter ved udbud af tjenesteydelser", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10213" },
                  { label: "AT-vejledning om Egentlig militærtjeneste", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10214" },
                  { label: "AT-vejledning om Aftaler, der begrænser Arbejdstilsynets tilsyn med overholdelsen af arbejdsmiljølovgivningen", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10215" },
                  { label: "AT-vejledning om Psykisk førstehjælp", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10216" },
                  { label: "Oversigt over ophævede AT-vejledninger", url: "https://www.retsinformation.dk/eli/retsinfo/2025/10233" },
                ].map((item) => (
                  <li key={item.url}>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                      style={{ color: "#0C6B3B" }}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </LawSection>
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
