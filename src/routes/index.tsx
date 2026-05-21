import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, CalendarHeart, GraduationCap, Heart, Star } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import heroHands from "@/assets/hero-hands.jpg";
import flatlay from "@/assets/services-flatlay.jpg";
import teaching from "@/assets/courses-teaching.jpg";
import { brl, type Service } from "@/lib/booking/data";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Afada das Unhas — Estúdio premium e cursos" },
      { name: "description", content: "Unhas impecáveis em um estúdio acolhedor. Agende seu horário ou inscreva-se nos cursos exclusivos da Afada das Unhas." },
      { property: "og:title", content: "Afada das Unhas — Estúdio premium e cursos" },
      { property: "og:description", content: "Unhas impecáveis em um estúdio acolhedor. Agende seu horário ou inscreva-se nos cursos exclusivos." },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: HomePage,
});

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  useEffect(() => {
    supabase.from('services').select('*').order('order', { ascending: true }).then(({ data }) => {
      setServices((data || []).map((s: any) => ({
        id: s.id, name: s.name, description: s.description || '', durationMin: s.duration_min, price: Number(s.price),
      })));
    });
  }, []);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-bege">
        <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-primary/15 blur-3xl" aria-hidden />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[var(--olive)]/15 blur-3xl" aria-hidden />

        <div className="relative mx-auto grid max-w-6xl gap-10 px-4 pt-12 pb-16 md:grid-cols-2 md:items-center md:gap-16 md:pt-20 md:pb-28">
          <motion.div {...fadeUp} className="order-2 md:order-1">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <BrandMark variant="mono" className="h-3.5 w-3.5 text-primary" /> Estúdio em Florianópolis
            </span>
            <h1 className="mt-5 font-display text-[2.6rem] leading-[1.05] text-foreground text-balance md:text-6xl">
              A arte de cuidar das suas <span className="text-primary italic">unhas</span>.
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground md:text-lg">
              Atendimento exclusivo, técnica refinada e cursos para quem quer transformar essa paixão em profissão.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <Link
                to="/agendamentos"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-luxury transition-all hover:scale-[1.02] active:scale-100"
              >
                <CalendarHeart className="h-5 w-5" />
                <span>Agende seu horário</span>
              </Link>
              <Link
                to="/cursos"
                className="group inline-flex h-14 items-center justify-center gap-2 rounded-2xl border border-primary/25 bg-card px-5 text-sm font-semibold text-primary shadow-soft transition-all hover:scale-[1.02] hover:bg-primary/5 active:scale-100"
              >
                <GraduationCap className="h-5 w-5" />
                <span>Cursos</span>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-5 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {[1,2,3].map((i) => (
                  <span key={i} className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-gradient-luxe text-[10px] font-semibold text-primary-foreground">
                    {i === 1 ? "J" : i === 2 ? "M" : "L"}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-primary text-primary" />
                <strong className="text-foreground">4.9</strong>
                <span>+2.500 clientes satisfeitas</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative order-1 md:order-2"
          >
            <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-[2rem] shadow-luxury md:max-w-md">
              <img
                src={heroHands}
                alt="Mãos com manicure marsala impecável"
                className="h-full w-full object-cover"
                width={1080}
                height={1440}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-cocoa/30 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-6 -left-2 hidden rounded-2xl bg-card px-4 py-3 shadow-soft md:flex md:items-center md:gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--olive)]/15 text-[var(--olive)]"><Heart className="h-5 w-5" /></span>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Feito com</p>
                <p className="text-sm font-semibold text-foreground">amor e técnica</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <motion.div {...fadeUp} className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Serviços</p>
          <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Cuidado em cada detalhe.</h2>
          <p className="mt-3 text-muted-foreground">Tratamentos pensados para realçar a beleza natural das suas mãos.</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <motion.article
              key={s.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="group rounded-2xl border border-border/70 bg-card p-5 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-luxury"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl text-foreground">{s.name}</h3>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{brl(s.price)}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{s.description}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                <span>{s.durationMin} minutos</span>
                <Link to="/agendamentos" className="inline-flex items-center gap-1 font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                  Reservar <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* DESTAQUE CURSOS */}
      <section className="bg-[var(--sand)] py-16 md:py-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 md:grid-cols-2 md:items-center">
          <motion.div {...fadeUp} className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-[2rem] shadow-luxury">
              <img src={teaching} alt="Aula prática de manicure" className="h-full w-full object-cover" loading="lazy" width={1280} height={960} />
            </div>
            <div className="absolute -top-5 -right-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground shadow-soft">
              <p className="text-[10px] uppercase tracking-widest opacity-80">Plataforma</p>
              <p className="font-display text-xl">Aulas exclusivas</p>
            </div>
          </motion.div>
          <motion.div {...fadeUp}>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Cursos online</p>
            <h2 className="mt-2 font-display text-4xl text-foreground md:text-5xl">Transforme paixão em profissão.</h2>
            <p className="mt-4 text-muted-foreground">
              Acesso ilimitado a aulas em vídeo organizadas por trilhas, com comunidade ativa, certificação e novos conteúdos toda semana.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-foreground">
              <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Trilhas do básico ao avançado</li>
              <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Comunidade e suporte direto</li>
              <li className="flex items-center gap-3"><span className="h-1.5 w-1.5 rounded-full bg-primary" /> Assinatura mensal sem fidelidade</li>
            </ul>
            <Link
              to="/cursos"
              className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-gradient-luxe px-6 text-sm font-semibold text-primary-foreground shadow-luxury transition-transform hover:scale-[1.02]"
            >
              Conheça os cursos <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:py-24">
        <motion.div {...fadeUp} className="relative overflow-hidden rounded-[2rem] bg-gradient-luxe p-8 text-primary-foreground shadow-luxury md:p-14">
          <img src={flatlay} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover opacity-15" loading="lazy" />
          <div className="relative max-w-2xl">
            <h2 className="font-display text-4xl md:text-5xl">Pronta para um momento só seu?</h2>
            <p className="mt-3 text-primary-foreground/85">Reserve em poucos cliques. Pague depois ou ganhe desconto pagando agora.</p>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <Link to="/agendamentos" className="inline-flex h-12 items-center justify-center rounded-xl bg-[var(--sand-soft)] px-5 text-sm font-semibold text-primary shadow-soft transition-transform hover:scale-[1.02]">
                Agendar agora
              </Link>
              <Link to="/cursos" className="inline-flex h-12 items-center justify-center rounded-xl border border-primary-foreground/40 px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
                Ver cursos
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
