import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, FilmIcon, MessageSquare, ShieldAlert } from "lucide-react";
import { Tabs } from "@mantine/core";
import { useSession } from "@/lib/auth-mock";
import { sections } from "@/lib/courses/data";
import { brl } from "@/lib/booking/data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo — Afada das Unhas" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

const mockBookings = [
  { id: "AF-9F2A1", client: "Marina Costa", service: "Manicure Russa", date: "2026-05-22", time: "14:00", total: 130, status: "Confirmado", payment: "Pago" },
  { id: "AF-A12C9", client: "Larissa Souza", service: "Esmaltação em Gel + Spa", date: "2026-05-23", time: "10:00", total: 180, status: "Pendente", payment: "No local" },
  { id: "AF-B22F0", client: "Juliana Lima", service: "Alongamento em Fibra", date: "2026-05-24", time: "16:00", total: 220, status: "Confirmado", payment: "Pago" },
];

const mockComments = [
  { id: "k1", user: "marina@email.com", video: "Anatomia da unha", text: "Ótima didática!", at: "há 1h" },
  { id: "k2", user: "cami@email.com", video: "Brocas e fresas", text: "Recomendam fresa cônica?", at: "há 3h" },
  { id: "k3", user: "bia@email.com", video: "Decoração francesinha moderna", text: "Adorei o tutorial.", at: "ontem" },
];

function AdminPage() {
  const session = useSession();
  if (!session?.isAdmin) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/15 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-3xl text-foreground">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">É necessário entrar com uma conta de administrador.</p>
        <Link to="/cursos" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Painel administrativo</p>
        <h1 className="mt-1 font-display text-4xl text-foreground md:text-5xl">Olá, administradora</h1>
        <p className="mt-2 text-muted-foreground">Gerencie agendamentos, conteúdos e comentários.</p>
      </header>

      <Tabs defaultValue="bookings" mt="xl" variant="pills" radius="md" color="marsala">
        <Tabs.List grow>
          <Tabs.Tab value="bookings" leftSection={<Calendar size={16} />}>Agendamentos</Tabs.Tab>
          <Tabs.Tab value="courses" leftSection={<FilmIcon size={16} />}>Cursos</Tabs.Tab>
          <Tabs.Tab value="comments" leftSection={<MessageSquare size={16} />}>Comentários</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="bookings" pt="lg">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="bg-[var(--sand)] text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="p-3">Código</th>
                  <th className="p-3">Cliente</th>
                  <th className="p-3 hidden md:table-cell">Serviço</th>
                  <th className="p-3">Data</th>
                  <th className="p-3 hidden sm:table-cell">Pagamento</th>
                  <th className="p-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {mockBookings.map((b) => (
                  <tr key={b.id} className="border-t border-border/60">
                    <td className="p-3 font-medium text-primary">{b.id}</td>
                    <td className="p-3 text-foreground">{b.client}</td>
                    <td className="p-3 hidden text-muted-foreground md:table-cell">{b.service}</td>
                    <td className="p-3 text-foreground">{b.date} {b.time}</td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        b.payment === "Pago" ? "bg-[var(--olive)]/15 text-[var(--olive)]" : "bg-muted text-muted-foreground",
                      )}>{b.payment}</span>
                    </td>
                    <td className="p-3 text-right font-semibold">{brl(b.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="courses" pt="lg">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((sec) => (
              <article key={sec.id} className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                <img src={sec.cover} alt={sec.name} className="h-32 w-full object-cover" />
                <div className="p-4">
                  <h3 className="font-display text-lg text-foreground">{sec.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">{sec.videos.length} vídeos</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Editar</button>
                    <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent">+ Upload</button>
                  </div>
                </div>
              </article>
            ))}
            <button className="grid place-items-center rounded-2xl border-2 border-dashed border-border bg-transparent p-6 text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary">
              + Nova seção
            </button>
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="comments" pt="lg">
          <ul className="space-y-3">
            {mockComments.map((c) => (
              <li key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span><strong className="text-foreground">{c.user}</strong> em <span className="text-primary">{c.video}</span></span>
                  <span>{c.at}</span>
                </div>
                <p className="mt-2 text-sm text-foreground">{c.text}</p>
              </li>
            ))}
          </ul>
        </Tabs.Panel>
      </Tabs>
    </div>
  );
}
