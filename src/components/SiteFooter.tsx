import { Linkedin } from "lucide-react";
import logoAsset from "@/assets/adweyse-logo.png.asset.json";

const LINKS = [
  "https://adweyse.dk/",
  "https://www.gratisapv.dk/",
  "https://www.arbejdsmiljoeuddannelse.dk/",
];

export function SiteFooter() {
  return (
    <footer
      className="w-full"
      style={{ backgroundColor: "#0C6B3B", color: "#ffffff" }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-6 py-10 md:grid-cols-3 md:gap-4 md:py-12">
        {/* Column 1: links */}
        <ul className="flex flex-col items-center gap-3 text-center md:items-start md:text-left">
          {LINKS.map((href) => (
            <li key={href}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold underline underline-offset-4 transition-opacity hover:opacity-80 sm:text-base"
              >
                {href}
              </a>
            </li>
          ))}
        </ul>

        {/* Column 2: logo */}
        <div className="flex items-center justify-center">
          <img
            src={logoAsset.url}
            alt="AdWeyse"
            className="h-20 w-auto sm:h-24 md:h-28"
          />
        </div>

        {/* Column 3: LinkedIn */}
        <div className="flex flex-col items-center gap-3 md:items-end">
          <span className="text-sm font-semibold sm:text-base">Følge os på</span>
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="inline-flex items-center gap-2 text-white transition-opacity hover:opacity-80"
          >
            <Linkedin size={28} fill="currentColor" strokeWidth={0} />
          </a>
        </div>
      </div>
    </footer>
  );
}
