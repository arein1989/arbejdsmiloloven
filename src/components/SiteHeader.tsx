import { Link } from "@tanstack/react-router";
import logoAsset from "@/assets/arbejdsmiljoloven-logo.png.asset.json";

const NAV_LINKS: { label: string; botId: "problem" | "regler" | "viden" }[] = [
  { label: "Arbejdsmiljøloven", botId: "problem" },
  { label: "Regler", botId: "regler" },
  { label: "Viden om arbejdsmiljø", botId: "viden" },
];

export function SiteHeader() {
  return (
    <header
      className="sticky top-0 z-30 w-full"
      style={{ backgroundColor: "#0C6B3B", color: "#ffffff" }}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center">
          <img
            src={logoAsset.url}
            alt="Arbejdsmiljøloven Adweyse"
            className="h-14 w-auto"
          />
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
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
        </nav>

        <div className="ml-auto flex items-center gap-3">
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
            className="inline-flex items-center justify-center px-5 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
            style={{
              backgroundColor: "#F78D0B",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
            }}
          >
            Kurser hos Adweyse
          </a>
        </div>
      </div>
    </header>
  );
}
