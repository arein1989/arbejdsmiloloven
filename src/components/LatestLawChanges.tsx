import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getLatestLawChanges } from "@/lib/lawChanges.functions";

function LawChangeBox({
  title,
  date,
  reason,
  href,
}: {
  title: string;
  date?: string;
  reason?: string | null;
  href?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        backgroundColor: "#F78D0B",
        color: "#000000",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
      }}
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-4 p-5 sm:p-6 cursor-pointer text-left">
          <h3 className="text-base font-semibold sm:text-lg" style={{ color: "#000000" }}>
            {title}
            {date ? (
              <span className="ml-2 text-xs font-normal opacity-80">{date}</span>
            ) : null}
          </h3>
          <Plus
            className={`h-5 w-5 shrink-0 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
            style={{ color: "#000000" }}
            strokeWidth={2}
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-5 pb-5 sm:px-6 sm:pb-6 space-y-3" style={{ color: "#000000" }}>
            <p className="text-sm leading-relaxed">
              {reason && reason.trim().length > 0
                ? reason
                : "Ingen yderligere beskrivelse tilgængelig for denne ændring."}
            </p>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-sm font-semibold underline"
                style={{ color: "#000000" }}
              >
                Læs hele ændringen på retsinformation.dk →
              </a>
            ) : null}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

export function LatestLawChanges() {
  const { data, isLoading } = useQuery({
    queryKey: ["latest-law-changes"],
    queryFn: () => getLatestLawChanges(),
    staleTime: 24 * 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const items = data ?? [];

  const formatDate = (iso: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("da-DK", { day: "2-digit", month: "2-digit", year: "numeric" });
  };

  const boxes = isLoading
    ? Array.from({ length: 4 }).map((_, idx) => (
        <LawChangeBox
          key={`placeholder-${idx}`}
          title="Henter seneste lovændringer…"
          reason="Henter de seneste arbejdsmiljø-ændringer fra Retsinformation.dk."
        />
      ))
    : items.length > 0
      ? items.map((item) => (
          <LawChangeBox
            key={item.document_id}
            title={item.short_name ?? item.document_id}
            date={item.change_date ? formatDate(item.change_date) : undefined}
            reason={item.reason}
            href={item.href ? item.href.replace(/\/xml$/, "") : undefined}
          />
        ))
      : [
          <LawChangeBox
            key="placeholder-empty"
            title="Ingen nye lovændringer endnu"
            reason="Der er endnu ikke registreret nye ændringer."
          />,
        ];

  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 pb-10 sm:px-6">
      <h3 className="text-xl font-semibold" style={{ color: "#000000" }}>
        De seneste lovændringer
      </h3>
      <div className="space-y-4">{boxes}</div>
    </section>
  );
}
