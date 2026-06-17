import linkedinAsset from "@/assets/linkedin-logo.png.asset.json";
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
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-10 px-6 py-10 md:grid-cols-3 md:items-center md:gap-6 md:py-12">
        {/* Column 1: links */}
        <div className="flex min-w-0 flex-col items-center gap-3 lg:items-start">
          {LINKS.map((href) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words text-sm font-semibold underline underline-offset-4 transition-opacity hover:opacity-80 sm:text-base"
            >
              {href}
            </a>
          ))}
        </div>

        {/* Column 2: logo */}
        <div className="flex min-w-0 items-center justify-center">
          <img
            src={logoAsset.url}
            alt="AdWeyse"
            className="h-20 w-auto sm:h-24 lg:h-28"
          />
        </div>

        {/* Column 3: LinkedIn */}
        <div className="flex min-w-0 flex-col items-center gap-3 lg:items-end">
          <span className="text-sm font-semibold sm:text-base">Følge os på</span>
          <a
            href="https://www.linkedin.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="transition-opacity hover:opacity-80"
          >
            <img
              src={linkedinAsset.url}
              alt="LinkedIn"
              className="h-8 w-auto sm:h-10"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}
