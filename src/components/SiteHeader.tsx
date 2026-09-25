import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import logoAsset from "@/assets/arbejdsmiljoloven-logo.png.asset.json";

const NAV_LINKS: { label: string; botId: "problem" | "regler" | "viden" }[] = [
  { label: "Arbejdsmiljøloven", botId: "problem" },
  { label: "Regler", botId: "regler" },
  { label: "Viden om arbejdsmiljø", botId: "viden" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{ backgroundColor: "#0C6B3B", color: "#ffffff" }}
    >
      <div className="mx-auto flex h-28 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center" onClick={close}>
          <img
            src={logoAsset.url}
            alt="Arbejdsmiljøloven Adweyse"
            className="h-20 w-auto object-contain sm:h-24 lg:h-[104px]"
          />
        </Link>



        <nav className="hidden flex-1 items-center justify-center gap-8 lg:flex">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.botId}
              to="/chat/$botId"
              params={{ botId: l.botId }}
              className="font-display text-lg font-semibold text-white transition-opacity hover:opacity-80"
            >
              {l.label}
            </Link>
          ))}
          <Link
            to="/nyheder"
            className="font-display text-lg font-semibold text-white transition-opacity hover:opacity-80"
          >
            Nyheder
          </Link>
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          <Link
            to="/chat/$botId"
            params={{ botId: "plan" }}
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
            style={{
              border: "1px solid #F78D0B",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              backgroundColor: "transparent",
            }}
          >
            Handlingsplan
          </Link>
          <a
            href="https://adweyse.dk/kurser/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-black transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: "#F78D0B",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}
          >
            Kurser hos Adweyse
          </a>
        </div>

        <button
          type="button"
          aria-label={open ? "Luk menu" : "Åbn menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-lg text-white transition hover:bg-white/10 lg:hidden"
        >
          {open ? <Menu size={26} className="hidden" /> : null}
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="lg:hidden" style={{ backgroundColor: "#0C6B3B" }}>
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 pb-6 pt-2 sm:px-6">
            <nav className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.botId}
                  to="/chat/$botId"
                  params={{ botId: l.botId }}
                  onClick={close}
                  className="font-display border-b border-white/15 py-3 text-base font-semibold text-white"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/nyheder"
                onClick={close}
                className="font-display border-b border-white/15 py-3 text-base font-semibold text-white"
              >
                Nyheder
              </Link>
            </nav>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/chat/$botId"
                params={{ botId: "plan" }}
                onClick={close}
                className="inline-flex flex-1 items-center justify-center px-5 py-3 text-sm font-medium text-white"
                style={{
                  border: "1px solid #F78D0B",
                  borderRadius: "16px",
                  backgroundColor: "transparent",
                }}
              >
                Handlingsplan
              </Link>
              <a
                href="https://adweyse.dk/kurser/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="inline-flex flex-1 items-center justify-center px-5 py-3 text-sm font-semibold text-black"
                style={{
                  backgroundColor: "#F78D0B",
                  borderRadius: "16px",
                }}
              >
                Kurser hos Adweyse
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
