import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import robotMascot from "@/assets/Chatbot4_1.png.asset.json";
import pdfIcon from "@/assets/pdf-icon.png.asset.json";
import robotIcon from "@/assets/robot-icon.png.asset.json";
import downloadIcon from "@/assets/download-icon.png.asset.json";
import arrowIcon from "@/assets/arrow-right-solid.png.asset.json";
import { createThread } from "@/lib/chat.functions";
import { getSessionId } from "@/lib/session";
import { savePendingPlanFile } from "@/lib/pending-plan-file";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function PlanWelcome() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const chooseFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.type !== "application/pdf") {
      setFile(null);
      setError("Vælg en PDF-fil.");
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("PDF-filen må højst fylde 10 MB.");
      return;
    }
    setError("");
    setFile(selected);
  };

  const beginAnalysis = async () => {
    if (!file || loading) return;
    setLoading(true);
    setError("");
    try {
      const thread = await createThread({ data: { sessionId: getSessionId(), botId: "plan" } });
      await savePendingPlanFile(thread.id, file);
      await navigate({
        to: "/chat/$botId/$threadId",
        params: { botId: "plan", threadId: thread.id },
      });
    } catch {
      setError("Filen kunne ikke åbnes. Prøv igen.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-plan-top text-primary-foreground">
      <SiteHeader />
      <main className="bg-gradient-to-b from-plan-top to-plan-bottom">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
          <section className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
            <img
              src={robotMascot.url}
              alt="Handlingsplan-assistenten"
              className="mx-auto h-64 w-64 object-contain sm:h-80 sm:w-80"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Velkommen!
                <span className="mt-2 block">
                  Handlingsplan – Din AI-assistent til APV og rapporter
                </span>
              </h1>
            </div>
          </section>

          <section className="mt-12 sm:mt-16">
            <h2 className="text-2xl font-semibold">Sådan fungerer Handlingsplan</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
              Her er en kort guide til, hvordan AI-assistenten ‘Handlingsplan’ fungerer, og hvordan processen forløber.
            </p>
            <div className="mt-7 grid gap-7 sm:grid-cols-3">
              {[
                { icon: pdfIcon, label: "Upload PDF" },
                { icon: robotIcon, label: "AI’en analyserer" },
                { icon: downloadIcon, label: "Download PDF" },
              ].map((step, index) => (
                <div className="relative" key={step.label}>
                  <div className="grid h-[85px] place-items-center rounded-lg bg-card shadow-plan ring-2 ring-inset ring-plan-stroke">
                    <img
                      src={step.icon.url}
                      alt=""
                      className="h-10 w-10 object-contain"
                    />
                  </div>
                  <h3 className="mt-3 text-center text-xl font-semibold text-foreground">
                    {step.label}
                  </h3>
                  {index < 2 ? (
                    <img
                      src={arrowIcon.url}
                      alt=""
                      className="absolute -right-[30px] top-[26px] z-10 hidden h-8 w-8 object-contain sm:block"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="mx-auto mt-14 max-w-xl">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={chooseFile}
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() => fileInputRef.current?.click()}
              className="h-auto w-full flex-col rounded-lg bg-card px-6 py-7 text-center text-plan-ink shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-card hover:text-plan-ink"
            >
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Upload className="h-7 w-7" />
              </span>
              <span className="mt-3 font-semibold text-action">Upload PDF</span>
              <span className="mt-2 text-sm">
                {file ? file.name : "Træk PDF hertil eller klik for at vælge"}
              </span>
              <span className="text-sm">Filen må maksimalt fylde 10 MB</span>
            </Button>
            {error ? (
              <p className="mt-3 text-center text-sm font-medium text-destructive">{error}</p>
            ) : null}
          </section>

          <section className="mx-auto mt-12 max-w-3xl rounded-lg bg-card p-6 text-plan-ink shadow-lg sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row">
              <img src={robotMascot.url} alt="" className="h-16 w-16 shrink-0 object-contain" />
              <div className="text-base leading-relaxed">
                <p>
                  Jeg hjælper dig med at identificere de bedste løsningsforslag og strukturerer
                  resultatet som en professionel rapport.
                </p>
                <p className="mt-3">
                  Upload en PDF – så analyserer jeg den og giver dig konkrete anbefalinger. Du kan
                  derefter stille opfølgende spørgsmål og downloade samtalen som en rapport.
                </p>
                <p className="mt-3">
                  Husk, enhver løsning skaber nye vinkler, der skal risikovurderes.
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={beginAnalysis}
              disabled={!file || loading}
              className="mt-6 h-12 w-full justify-between rounded-md px-5 text-base"
            >
              <span>
                {loading
                  ? "Åbner din handlingsplan…"
                  : file
                    ? "Analysér den valgte PDF"
                    : "Upload din PDF først"}
              </span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}
