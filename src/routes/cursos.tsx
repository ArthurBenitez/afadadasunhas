import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, LogOut, ShieldCheck, Mail, LogIn, UserPlus } from "lucide-react";
import { TextInput, PasswordInput, Button, Alert } from "@mantine/core";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos — A fada das Unhas" },
      { name: "description", content: "Cursos exclusivos de manicure e nail art para assinantes." },
      { property: "og:title", content: "Cursos — A fada das Unhas" },
      { property: "og:url", content: "/cursos" },
    ],
    links: [{ rel: "canonical", href: "/cursos" }],
  }),
  component: CursosLayout,
});

function CursosLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!session) return <LoginGate />;
  
  return <Outlet />;
}

function LoginGate() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        nav({ to: "/cursos" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName }
          }
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu e-mail.");
        setIsLogin(true);
      }
    } catch (error: any) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto grid min-h-[80vh] max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-2">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <Lock className="h-3.5 w-3.5" /> Área de assinantes
        </span>
        <h1 className="mt-4 font-display text-4xl text-foreground md:text-5xl">
          {isLogin ? "Entre para começar a estudar" : "Crie sua conta"}
        </h1>
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
        onSubmit={handleAuth}
        className="rounded-3xl border border-border bg-card p-6 shadow-soft md:p-8"
      >
        <h2 className="font-display text-2xl text-foreground">{isLogin ? "Entrar" : "Cadastrar"}</h2>
        <p className="text-sm text-muted-foreground">
          {isLogin ? "Acesse sua conta de assinante." : "Junte-se a nós hoje mesmo."}
        </p>
        
        <div className="mt-5 space-y-4">
          {!isLogin && (
            <TextInput 
              label="Nome completo" 
              placeholder="Sua Maria" 
              size="md" 
              radius="md" 
              value={fullName} 
              onChange={(e) => setFullName(e.currentTarget.value)} 
              required 
            />
          )}
          <TextInput 
            label="E-mail" 
            placeholder="voce@email.com" 
            size="md" 
            radius="md" 
            value={email} 
            onChange={(e) => setEmail(e.currentTarget.value)} 
            required 
            leftSection={<Mail size={16} />}
          />
          <PasswordInput 
            label="Senha" 
            placeholder="••••••••" 
            size="md" 
            radius="md" 
            value={password} 
            onChange={(e) => setPassword(e.currentTarget.value)} 
            required 
          />
          
          {err && (
            <Alert color="red" variant="light">
              {err}
            </Alert>
          )}

          <Button 
            type="submit" 
            loading={loading}
            fullWidth
            size="md"
            radius="md"
            className="bg-gradient-luxe shadow-luxury hover:opacity-90"
          >
            {isLogin ? "Acessar conteúdo" : "Criar conta"}
          </Button>

          <div className="text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              {isLogin ? "Ainda não tem assinatura?" : "Já tem uma conta?"}
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="ml-1 font-semibold text-primary hover:underline"
              >
                {isLogin ? "Comece por R$ 49/mês" : "Fazer login"}
              </button>
            </p>
          </div>
        </div>
      </motion.form>
    </div>
  );
}
