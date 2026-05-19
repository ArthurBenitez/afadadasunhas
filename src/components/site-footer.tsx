import { Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border/70 bg-[var(--sand)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-primary">afada das unhas</p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Estúdio premium dedicado à arte das unhas e formação de profissionais apaixonadas.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-foreground">Navegação</p>
          <Link to="/agendamentos" className="block text-muted-foreground hover:text-primary">Agendamentos</Link>
          <Link to="/cursos" className="block text-muted-foreground hover:text-primary">Cursos</Link>
          <Link to="/admin" className="block text-muted-foreground hover:text-primary">Área Administrativa</Link>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">Contato</p>
          <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> Florianópolis - Itacorubi, SC</p>
          <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> contato@afadadasunhas.com</p>
          <p className="flex items-center gap-2"><Instagram className="h-4 w-4 text-primary" /> @afadadasunhas</p>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Afada das Unhas. Todos os direitos reservados.
      </div>
    </footer>
  );
}
