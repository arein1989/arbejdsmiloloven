import { Link, useLocation } from "@tanstack/react-router";
import { BOT_LIST } from "@/lib/bots";

export function SiteHeader() {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-primary">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">A</span>
          arbejdsmiljøhjælp.dk
        </Link>
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {BOT_LIST.map((b) => {
            const active = pathname.startsWith(`/chat/${b.id}`);
            return (
              <Link
                key={b.id}
                to="/chat/$botId"
                params={{ botId: b.id }}
                className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/80 hover:bg-muted hover:text-foreground"
                }`}
              >
                {b.short}
              </Link>
            );
          })}
        </nav>
        <Link
          to="/"
          className="ml-auto text-xs text-muted-foreground hover:text-foreground md:ml-0"
        >
          Forside
        </Link>
      </div>
    </header>
  );
}
