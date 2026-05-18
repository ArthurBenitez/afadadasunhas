import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, LogOut, Play, ShieldCheck } from "lucide-react";
import { TextInput, PasswordInput } from "@mantine/core";
import { useSession, login, logout } from "@/lib/auth-mock";
import { sections } from "@/lib/courses/data";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos — Afada das Unhas" },
      { name: "description", content: "Cursos exclusivos de manicure e nail art para assinantes." },
      { property: "og:title", content: "Cursos — Afada das Unhas" },
      { property: "og:url", content: "/cursos" },
    ],
    links: [{ rel: "canonical", href: "/cursos" }],
  }),
  component: CursosLayout,
});

function CursosLayout() {
  const session = useSession();
  if (!session) return <LoginGate />;
  return <Outlet />;
}

function LoginGate() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();
  return (
    <div className="mx-auto grid min-h-[80vh] max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Lock className="h-3.5 w-3.5" /> Área de assinantes
        </span>
        <h1 className="mt-4 font-display text-4xl text-foreground md:text-5xl">Entre para começar a estudar</h1>
        <p className="mt-3 text-muted-foreground">
          Acesso ilimitado a todas as trilhas, novas aulas semanais e comunidade ativa por uma assinatura mensal.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-foreground/85">
          <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--olive)]" /> Pagamento seguro e recorrente</li>
          <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--olive)]" /> Cancele a qualquer momento</li>
          <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--olive)]" /> Mais de 80 horas de conteúdo</li>
        </ul>
      </motion.div>
      <motion.form
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
        onSubmit={(e) => {
          e.preventDefault();
          const r = login(email, password);
          if (!r.ok) return setErr(r.error || "Erro");
          nav({ to: "/cursos" });
        }}
        className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
      >
        <h2 className="font-display text-2xl text-foreground">Entrar</h2>
        <p className="text-sm text-muted-foreground">Acesse sua conta de assinante.</p>
        <div className="mt-5 space-y-4">
          <TextInput label="E-mail" placeholder="voce@email.com" size="md" radius="md" value={email} onChange={(e) => setEmail(e.currentTarget.value)} required />
          <PasswordInput label="Senha" placeholder="••••••••" size="md" radius="md" value={password} onChange={(e) => setPassword(e.currentTarget.value)} required />
          {err && <p className="text-sm text-destructive">{err}</p>}
          <button type="submit" className="h-12 w-full rounded-xl bg-gradient-luxe text-sm font-semibold text-primary-foreground shadow-luxury">
            Acessar conteúdo
          </button>
          <p className="text-center text-xs text-muted-foreground">
            Ainda não tem assinatura? <a href="#" className="font-semibold text-primary">Comece por R$ 49/mês</a>
          </p>
        </div>
      </motion.form>
    </div>
  );
}
