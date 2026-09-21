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
          />

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
