import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogOut, Play, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Modal, Button, Text } from "@mantine/core";
import { toast } from "sonner";

export const Route = createFileRoute("/cursos/")({
  component: CursosHome,
});

function CursosHome() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [activeExpiresAt, setActiveExpiresAt] = useState<string | null>(null);
  const navigate = useNavigate();

  const isSubscriptionActive = (sub: any, admin: boolean) => {
    if (admin) return true;
    if (!sub?.is_active) return false;
    if (sub.expires_at && new Date(sub.expires_at) <= new Date()) return false;
    return true;
  };

  useEffect(() => {
    async function loadData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate({ to: "/cursos" });
        return;
      }
      setSession(session);

      // Load profile, subscription, roles and sections
      const [profileRes, subRes, sectionsRes, rolesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('sections').select('*, videos(*)').order('order', { ascending: true }),
        supabase.from('user_roles').select('role').eq('user_id', session.user.id),
      ]);

      setProfile(profileRes.data);
      setSubscription(subRes.data);
      setSections(sectionsRes.data || []);
      const admin = (rolesRes.data || []).some((r: any) => r.role === 'admin')
        || profileRes.data?.role === 'admin';
      setIsAdmin(admin);

      // Check URL for ?paywall=1 (came from blocked video access)
      if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('paywall') === '1') {
        if (!isSubscriptionActive(subRes.data, admin)) {
          setShowPaymentModal(true);
        }
      }

      setLoading(false);
    }

    loadData();

    // Set up realtime
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sections' }, () => {
        loadData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, () => {
        loadData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/cursos" });
  };

  const handleVideoClick = (e: React.MouseEvent, videoId: string) => {
    if (isSubscriptionActive(subscription, isAdmin)) {
      navigate({ to: "/cursos/$videoId", params: { videoId } });
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setShowPaymentModal(true);
  };

  const handlePayment = async () => {
    if (!session) return;
    setProcessingPayment(true);
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    // Upsert in case user has no subscription row yet
    const { data, error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: session.user.id,
        is_active: true,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' })
      .select()
      .single();

    setProcessingPayment(false);

    if (error) {
      toast.error("Erro ao processar pagamento. Tente novamente.");
      return;
    }

    setSubscription(data);
    setActiveExpiresAt(expiresAt.toISOString());
    setShowPaymentModal(false);
    setShowSuccessModal(true);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--cocoa)] text-[var(--sand)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--cocoa)] pb-20 text-[var(--sand-soft)]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-6">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--sand)]/60">Bem-vinda</p>
          <h1 className="font-display text-2xl md:text-3xl">{profile?.full_name || session?.user?.email}</h1>
        </div>
        <div className="flex items-center gap-2">
          {profile?.role === 'admin' && (
            <Link to="/admin" className="rounded-full border border-[var(--sand)]/30 px-4 py-2 text-xs font-medium hover:bg-white/5">Admin</Link>
          )}
          <button onClick={handleLogout} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sand)]/30 px-4 py-2 text-xs font-medium hover:bg-white/5">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      {sections.length > 0 ? (
        <>
          {/* Featured */}
          <section className="relative mx-auto max-w-7xl px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="relative overflow-hidden rounded-3xl">
              <img src={sections[0].cover_url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop"} alt={sections[0].title} className="h-[260px] w-full object-cover md:h-[420px]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--cocoa)] via-[var(--cocoa)]/60 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10">
                <p className="text-xs uppercase tracking-[0.25em] text-primary">Em destaque</p>
                <h2 className="mt-1 font-display text-3xl md:text-5xl">{sections[0].title}</h2>
                <p className="mt-2 max-w-xl text-sm text-[var(--sand)]/80 md:text-base">{sections[0].description}</p>
                {sections[0].videos?.[0] && (
                  <button
                    type="button"
                    onClick={(e) => handleVideoClick(e, sections[0].videos[0].id)}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-luxury hover:scale-[1.02]"
                  >
                    <Play className="h-4 w-4 fill-current" /> Assistir agora
                  </button>
                )}
              </div>
            </motion.div>
          </section>

          {/* Carousels */}
          <div className="mt-10 space-y-10">
            {sections.map((sec) => (
              <section key={sec.id} className="mx-auto max-w-7xl px-4">
                <div className="mb-3 flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-2xl">{sec.title}</h3>
                    <p className="text-xs text-[var(--sand)]/60">{sec.description}</p>
                  </div>
                </div>
                <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {sec.videos?.sort((a: any, b: any) => a.order - b.order).map((v: any) => (
                    <button key={v.id} type="button" onClick={(e) => handleVideoClick(e, v.id)} className="group w-[78%] shrink-0 text-left sm:w-[42%] md:w-[28%] lg:w-[22%]">
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40">
                        <img src={v.thumbnail_url || "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?q=80&w=1000&auto=format&fit=crop"} alt={v.title} className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                        <span className="absolute inset-0 grid place-items-center opacity-0 transition-opacity group-hover:opacity-100">
                          <span className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground shadow-luxury">
                            <Play className="h-5 w-5 fill-current" />
                          </span>
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium">{v.title}</p>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <h2 className="font-display text-2xl">Nenhum conteúdo disponível ainda.</h2>
          <p className="mt-2 text-[var(--sand)]/60">Aguarde as novidades da Afada das Unhas!</p>
        </div>
      )}

      {/* Payment Required Modal */}
      <Modal 
        opened={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        withCloseButton={true}
        centered
        radius="xl"
        transitionProps={{ transition: 'pop', duration: 300 }}
        styles={{
          content: { backgroundColor: '#2F1B1A', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="text-center p-4"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/20 text-primary">
            <CreditCard className="h-8 w-8" />
          </div>
          <Text size="xl" fw={700} className="mt-4 font-display text-[var(--sand)]">Você ainda não pagou a mensalidade do curso!</Text>
          <Text size="sm" className="mt-2 text-[var(--sand)]/70">
            Para acessar todo o conteúdo exclusivo da Afada das Unhas, você precisa ter uma assinatura ativa.
          </Text>
          <Button 
            fullWidth 
            className="mt-6 bg-gradient-luxe shadow-luxury" 
            size="lg" 
            radius="md"
            loading={processingPayment}
            onClick={handlePayment}
          >
            Ir para o pagamento
          </Button>
        </motion.div>
      </Modal>

      {/* Payment Success Modal */}
      <Modal
        opened={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        withCloseButton={false}
        centered
        radius="xl"
        transitionProps={{ transition: 'pop', duration: 300 }}
        styles={{
          content: { backgroundColor: '#2F1B1A', border: '1px solid rgba(255,255,255,0.1)' }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="text-center p-4"
        >
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-400"
          >
            <CheckCircle2 className="h-12 w-12" />
          </motion.div>
          <Text size="xl" fw={700} className="mt-4 font-display text-[var(--sand)]">Pagamento confirmado!</Text>
          <Text size="sm" className="mt-2 text-[var(--sand)]/70">
            Acesso liberado a todos os módulos até{" "}
            <strong className="text-[var(--sand)]">
              {activeExpiresAt && new Date(activeExpiresAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
            </strong>.
          </Text>
          <Button
            fullWidth
            className="mt-6 bg-gradient-luxe shadow-luxury"
            size="lg"
            radius="md"
            onClick={() => setShowSuccessModal(false)}
          >
            Começar a assistir
          </Button>
        </motion.div>
      </Modal>
    </div>
  );
}
