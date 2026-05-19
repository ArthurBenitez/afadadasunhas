import { Link, useLocation } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/brand-mark";

const navItems = [
  { to: "/", label: "Início" },
  { to: "/agendamentos", label: "Agendamentos" },
  { to: "/cursos", label: "Cursos" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2" onClick={() => setOpen(false)}>
          <BrandMark className="h-9 w-9 shadow-soft rounded-full" />
          <span className="font-display text-xl text-primary leading-none">
            afada<span className="text-foreground/70">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "text-sm font-medium tracking-wide text-foreground/70 transition-colors hover:text-primary",
                pathname === item.to && "text-primary",
              )}
            >
              {item.label}
            </Link>
          ))}
          <Link
            to="/agendamentos"
            className="rounded-full bg-primary px-5 py-2 text-xs font-semibold uppercase tracking-wider text-primary-foreground shadow-soft transition-transform hover:scale-[1.03]"
          >
            Agendar
          </Link>
        </nav>

        <button
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="grid h-11 w-11 place-items-center rounded-full border border-border bg-card text-foreground md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border/60 bg-background md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-3 text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-primary",
                  pathname === item.to && "bg-accent text-primary",
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/agendamentos"
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-primary px-3 py-3 text-center text-sm font-semibold text-primary-foreground"
            >
              Agendar agora
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
