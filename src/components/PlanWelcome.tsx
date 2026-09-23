import { useRef, useState, type ChangeEvent } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowRight, Bot, Download, FileText, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";
import robotMascot from "@/assets/robot-mascot.png";
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
      <main className="bg-gradient-to-b from-plan-top via-plan-top to-plan-bottom">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
          <section className="grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]">
            <img
              src={robotMascot}
              alt="Handlingsplan-assistenten"
              className="mx-auto h-64 w-64 object-contain sm:h-80 sm:w-80"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
                Velkommen!
                <span className="mt-2 block">Handlingsplan – Din AI-assistent til APV og rapporter</span>
              </h1>
              <p className="mt-4 text-base leading-relaxed text-primary-foreground/90">
                Upload din PDF, og få hjælp til at identificere løsningsforslag og samle resultatet i en professionel rapport.
              </p>
            </div>
          </section>

          <section className="mt-12 sm:mt-16">
            <h2 className="text-2xl font-semibold">Sådan fungerer Handlingsplan</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-primary-foreground/90 sm:text-base">
              Her er en kort guide til, hvordan AI-assistenten fører dig gennem processen.
            </p>
            <div className="mt-7 grid gap-5 sm:grid-cols-3">
              {[
                { icon: FileText, label: "Upload PDF" },
                { icon: Bot, label: "AI’en analyserer" },
                { icon: Download, label: "Download PDF" },
              ].map((step, index) => (
                <div className="relative" key={step.label}>
                  <div className="grid h-28 place-items-center rounded-lg bg-card text-plan-ink shadow-lg">
                    <step.icon className="h-10 w-10" strokeWidth={1.4} />
                  </div>
                  <h3 className="mt-3 text-center text-xl font-semibold text-foreground">{step.label}</h3>
                  {index < 2 ? (
                    <ArrowRight className="absolute -right-4 top-10 z-10 hidden h-8 w-8 text-foreground sm:block" strokeWidth={2.5} />
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full cursor-pointer flex-col items-center rounded-lg bg-card px-6 py-7 text-center text-plan-ink shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="grid h-14 w-14 place-items-center rounded-lg bg-primary text-primary-foreground">
                <Upload className="h-7 w-7" />
              </span>
              <span className="mt-3 font-semibold text-action">Upload PDF</span>
              <span className="mt-2 text-sm">{file ? file.name : "Træk PDF hertil eller klik for at vælge"}</span>
              <span className="text-sm">Filen må maksimalt fylde 10 MB</span>
            </button>
            {error ? <p className="mt-3 text-center text-sm font-medium text-destructive">{error}</p> : null}
          </section>

          <section className="mx-auto mt-12 max-w-3xl rounded-lg bg-card p-6 text-plan-ink shadow-lg sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row">
              <img src={robotMascot} alt="" className="h-16 w-16 shrink-0 object-contain" />
              <div className="text-base leading-relaxed">
                <p>Jeg hjælper dig med at identificere de bedste løsningsforslag og strukturerer resultatet som en professionel rapport.</p>
                <p className="mt-3">Upload en PDF – så analyserer jeg den og giver dig konkrete anbefalinger. Du kan derefter stille opfølgende spørgsmål og downloade samtalen som en rapport.</p>
                <p className="mt-3">Husk, enhver løsning skaber nye vinkler, der skal risikovurderes.</p>
              </div>
            </div>
            <Button
              type="button"
              onClick={beginAnalysis}
              disabled={!file || loading}
              className="mt-6 h-12 w-full justify-between rounded-md px-5 text-base"
            >
              <span>{loading ? "Åbner din handlingsplan…" : file ? "Analysér den valgte PDF" : "Upload din PDF først"}</span>
              <ArrowRight className="h-5 w-5" />
            </Button>
          </section>
        </div>
      </main>
    </div>
  );
}