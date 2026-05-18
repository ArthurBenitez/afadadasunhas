import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogOut, Play } from "lucide-react";
import { useSession, logout } from "@/lib/auth-mock";
import { sections } from "@/lib/courses/data";

export const Route = createFileRoute("/cursos/")({
  component: CursosHome,
});

function CursosHome() {
  const session = useSession();
  return (
    <div className="bg-[var(--cocoa)] pb-20 text-[var(--sand-soft)]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--sand)]/60">Bem-vinda</p>
          <h1 className="font-display text-2xl md:text-3xl">{session?.email}</h1>
        </div>
        <div className="flex items-center gap-2">
          {session?.isAdmin && (
            <Link to="/admin" className="rounded-full border border-[var(--sand)]/30 px-4 py-2 text-xs font-medium hover:bg-white/5">Admin</Link>
          )}
          <button onClick={logout} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sand)]/30 px-4 py-2 text-xs font-medium hover:bg-white/5">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      {/* Featured */}
      <section className="relative mx-auto max-w-7xl px-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative overflow-hidden rounded-3xl">
          <img src={sections[0].cover} alt={sections[0].name} className="h-[260px] w-full object-cover md:h-[420px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--cocoa)] via-[var(--cocoa)]/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10">
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Em destaque</p>
            <h2 className="mt-1 font-display text-3xl md:text-5xl">{sections[0].name}</h2>
            <p className="mt-2 max-w-xl text-sm text-[var(--sand)]/80 md:text-base">{sections[0].description}</p>
            <Link
              to="/cursos/$videoId" params={{ videoId: sections[0].videos[0].id }}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-luxury hover:scale-[1.02]"
            >
              <Play className="h-4 w-4 fill-current" /> Assistir agora
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Carousels */}
      <div className="mt-10 space-y-10">
        {sections.map((sec) => (
          <section key={sec.id} className="mx-auto max-w-7xl px-4">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h3 className="font-display text-2xl">{sec.name}</h3>
                <p className="text-xs text-[var(--sand)]/60">{sec.description}</p>
              </div>
            </div>
            <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {sec.videos.map((v) => (
                <Link key={v.id} to="/cursos/$videoId" params={{ videoId: v.id }} className="group w-[78%] shrink-0 sm:w-[42%] md:w-[28%] lg:w-[22%]">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                    <img src={v.thumbnail} alt={v.title} className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-medium">{v.duration}</span>
                    <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-luxury">
                        <Play className="h-5 w-5 fill-current" />
                      </span>
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-medium">{v.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
