import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { LogOut, Play, CreditCard, Loader2, CheckCircle2, Plus, Edit2, Trash2, Upload, Settings, X } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Modal, Button, Text, TextInput, Textarea, NumberInput } from "@mantine/core";
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

  // Admin modal state
  const [sectionModal, setSectionModal] = useState<{ open: boolean; editing: any }>({ open: false, editing: null });
  const [secTitle, setSecTitle] = useState("");
  const [secDesc, setSecDesc] = useState("");
  const [secOrder, setSecOrder] = useState<number | string>(0);

  const [videoModal, setVideoModal] = useState<{ open: boolean; sectionId: string | null; editing: any }>({ open: false, sectionId: null, editing: null });
  const [vidTitle, setVidTitle] = useState("");
  const [vidDesc, setVidDesc] = useState("");
  const [vidUrl, setVidUrl] = useState("");
  const [vidThumb, setVidThumb] = useState("");
  const [vidOrder, setVidOrder] = useState<number | string>(0);
  const [vidFile, setVidFile] = useState<File | null>(null);
  const [vidThumbFile, setVidThumbFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [servicesModalOpen, setServicesModalOpen] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [editingService, setEditingService] = useState<any>(null);
  const [svcName, setSvcName] = useState("");
  const [svcDesc, setSvcDesc] = useState("");
  const [svcDuration, setSvcDuration] = useState<number | string>(60);
  const [svcPrice, setSvcPrice] = useState<number | string>(0);
  const [svcOrder, setSvcOrder] = useState<number | string>(0);

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
      const [profileRes, subRes, sectionsRes, rolesRes, servicesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', session.user.id).single(),
        supabase.from('subscriptions').select('*').eq('user_id', session.user.id).maybeSingle(),
        supabase.from('sections').select('*, videos(*)').order('order', { ascending: true }),
        supabase.from('user_roles').select('role').eq('user_id', session.user.id),
        supabase.from('services').select('*').order('order', { ascending: true }),
      ]);

      setProfile(profileRes.data);
      setSubscription(subRes.data);
      setSections(sectionsRes.data || []);
      setServices(servicesRes.data || []);
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, () => {
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

  // ===== Section CRUD =====
  const openNewSection = () => {
    setSecTitle(""); setSecDesc(""); setSecOrder(sections.length);
    setSectionModal({ open: true, editing: null });
  };
  const openEditSection = (sec: any) => {
    setSecTitle(sec.title); setSecDesc(sec.description || ""); setSecOrder(sec.order);
    setSectionModal({ open: true, editing: sec });
  };
  const saveSection = async () => {
    if (!secTitle.trim()) return;
    const payload = { title: secTitle, description: secDesc, order: Number(secOrder) || 0 };
    const res = sectionModal.editing
      ? await supabase.from('sections').update(payload).eq('id', sectionModal.editing.id)
      : await supabase.from('sections').insert([payload]);
    if (res.error) return toast.error("Erro ao salvar seção");
    toast.success(sectionModal.editing ? "Seção atualizada" : "Seção criada");
    setSectionModal({ open: false, editing: null });
  };
  const deleteSection = async (id: string) => {
    if (!confirm("Excluir esta seção e todos os seus vídeos?")) return;
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir"); else toast.success("Seção excluída");
  };

  // ===== Video CRUD =====
  const openNewVideo = (sectionId: string, currentCount: number) => {
    setVidTitle(""); setVidDesc(""); setVidUrl(""); setVidThumb(""); setVidOrder(currentCount);
    setVidFile(null); setVidThumbFile(null);
    setVideoModal({ open: true, sectionId, editing: null });
  };
  const openEditVideo = (v: any) => {
    setVidTitle(v.title); setVidDesc(v.description || ""); setVidUrl(v.video_url); setVidThumb(v.thumbnail_url || ""); setVidOrder(v.order);
    setVidFile(null); setVidThumbFile(null);
    setVideoModal({ open: true, sectionId: v.section_id, editing: v });
  };
  const saveVideo = async () => {
    if (!vidTitle.trim() || !videoModal.sectionId) return;
    if (!videoModal.editing && !vidFile) {
      return toast.error("Selecione o arquivo de vídeo");
    }
    setUploading(true);
    try {
      let videoUrl = vidUrl;
      let thumbUrl = vidThumb;
      const userId = session?.user?.id ?? "anon";

      if (vidFile) {
        const path = `${userId}/${crypto.randomUUID()}-${vidFile.name.replace(/[^\w.\-]/g, "_")}`;
        const up = await supabase.storage.from('course-videos').upload(path, vidFile, {
          contentType: vidFile.type, upsert: false,
        });
        if (up.error) throw up.error;
        videoUrl = supabase.storage.from('course-videos').getPublicUrl(path).data.publicUrl;
      }

      if (vidThumbFile) {
        const path = `${userId}/${crypto.randomUUID()}-${vidThumbFile.name.replace(/[^\w.\-]/g, "_")}`;
        const up = await supabase.storage.from('course-thumbnails').upload(path, vidThumbFile, {
          contentType: vidThumbFile.type, upsert: false,
        });
        if (up.error) throw up.error;
        thumbUrl = supabase.storage.from('course-thumbnails').getPublicUrl(path).data.publicUrl;
      }

      if (!videoUrl) {
        toast.error("Arquivo de vídeo é obrigatório");
        return;
      }

      const payload = {
        section_id: videoModal.sectionId,
        title: vidTitle, description: vidDesc, video_url: videoUrl,
        thumbnail_url: thumbUrl || null, order: Number(vidOrder) || 0,
      };
      const res = videoModal.editing
        ? await supabase.from('videos').update(payload).eq('id', videoModal.editing.id)
        : await supabase.from('videos').insert([payload]);
      if (res.error) throw res.error;
      toast.success(videoModal.editing ? "Vídeo atualizado" : "Vídeo adicionado");
      setVideoModal({ open: false, sectionId: null, editing: null });
    } catch (err: any) {
      toast.error(err?.message || "Erro ao salvar vídeo");
    } finally {
      setUploading(false);
    }
  };
  const deleteVideo = async (id: string) => {
    if (!confirm("Excluir este vídeo?")) return;
    const { error } = await supabase.from('videos').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir"); else toast.success("Vídeo excluído");
  };

  // ===== Service CRUD =====
  const resetServiceForm = () => {
    setEditingService(null);
    setSvcName(""); setSvcDesc(""); setSvcDuration(60); setSvcPrice(0); setSvcOrder(services.length);
  };
  const openEditService = (s: any) => {
    setEditingService(s);
    setSvcName(s.name); setSvcDesc(s.description || "");
    setSvcDuration(s.duration_min); setSvcPrice(Number(s.price)); setSvcOrder(s.order);
  };
  const saveService = async () => {
    if (!svcName.trim()) return;
    const payload = {
      name: svcName, description: svcDesc,
      duration_min: Number(svcDuration) || 0, price: Number(svcPrice) || 0,
      order: Number(svcOrder) || 0,
    };
    const res = editingService
      ? await supabase.from('services').update(payload).eq('id', editingService.id)
      : await supabase.from('services').insert([payload]);
    if (res.error) return toast.error("Erro ao salvar serviço");
    toast.success(editingService ? "Serviço atualizado" : "Serviço criado");
    resetServiceForm();
  };
  const deleteService = async (id: string) => {
    if (!confirm("Excluir este serviço?")) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir"); else toast.success("Serviço excluído");
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {isAdmin && (
            <>
              <button onClick={openNewSection} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-luxury hover:scale-[1.02]">
                <Plus className="h-3.5 w-3.5" /> Adicionar seção
              </button>
              <button onClick={() => { resetServiceForm(); setServicesModalOpen(true); }} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--sand)]/30 px-4 py-2 text-xs font-medium hover:bg-white/5">
                <Settings className="h-3.5 w-3.5" /> Gerenciar serviços
              </button>
              <Link to="/admin" className="rounded-full border border-[var(--sand)]/30 px-4 py-2 text-xs font-medium hover:bg-white/5">Painel</Link>
            </>
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
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <button onClick={() => openNewVideo(sec.id, sec.videos?.length || 0)} className="inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-[11px] font-semibold text-primary-foreground hover:scale-[1.02]">
                        <Upload className="h-3 w-3" /> Fazer upload
                      </button>
                      <button onClick={() => openEditSection(sec)} className="grid h-7 w-7 place-items-center rounded-full border border-[var(--sand)]/30 hover:bg-white/5" title="Editar seção">
                        <Edit2 className="h-3 w-3" />
                      </button>
                      <button onClick={() => deleteSection(sec.id)} className="grid h-7 w-7 place-items-center rounded-full border border-red-400/40 text-red-300 hover:bg-red-500/10" title="Excluir seção">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {sec.videos?.sort((a: any, b: any) => a.order - b.order).map((v: any) => (
                    <div key={v.id} className="group relative w-[78%] shrink-0 sm:w-[42%] md:w-[28%] lg:w-[22%]">
                      <button type="button" onClick={(e) => handleVideoClick(e, v.id)} className="block w-full text-left">
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
                      {isAdmin && (
                        <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => openEditVideo(v)} className="grid h-7 w-7 place-items-center rounded-full bg-black/70 text-white hover:bg-black" title="Editar vídeo">
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button onClick={() => deleteVideo(v.id)} className="grid h-7 w-7 place-items-center rounded-full bg-red-600/90 text-white hover:bg-red-600" title="Excluir vídeo">
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
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
          {isAdmin && (
            <button onClick={openNewSection} className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-luxury">
              <Plus className="h-4 w-4" /> Criar primeira seção
            </button>
          )}
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

      {/* Admin: Section Modal */}
      <Modal
        opened={sectionModal.open}
        onClose={() => setSectionModal({ open: false, editing: null })}
        title={<span className="font-display text-lg">{sectionModal.editing ? "Editar seção" : "Nova seção"}</span>}
        centered radius="lg"
      >
        <div className="space-y-3">
          <TextInput label="Título" value={secTitle} onChange={(e) => setSecTitle(e.currentTarget.value)} required />
          <Textarea label="Descrição" value={secDesc} onChange={(e) => setSecDesc(e.currentTarget.value)} rows={3} />
          <NumberInput label="Ordem" value={secOrder} onChange={setSecOrder} min={0} />
          <Button fullWidth onClick={saveSection} className="mt-2 bg-gradient-luxe">Salvar</Button>
        </div>
      </Modal>

      {/* Admin: Video Modal */}
      <Modal
        opened={videoModal.open}
        onClose={() => setVideoModal({ open: false, sectionId: null, editing: null })}
        title={<span className="font-display text-lg">{videoModal.editing ? "Editar vídeo" : "Adicionar vídeo"}</span>}
        centered radius="lg"
      >
        <div className="space-y-3">
          <TextInput label="Título" value={vidTitle} onChange={(e) => setVidTitle(e.currentTarget.value)} required />
          <Textarea label="Descrição" value={vidDesc} onChange={(e) => setVidDesc(e.currentTarget.value)} rows={3} />

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--cocoa)]">
              Arquivo de vídeo {videoModal.editing ? "(opcional — manter atual)" : "*"}
            </label>
            {videoModal.editing && vidUrl && !vidFile && (
              <video src={vidUrl} controls className="mb-1 max-h-32 w-full rounded-md bg-black" />
            )}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVidFile(e.currentTarget.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
            />
            {vidFile && <p className="text-xs text-[var(--cocoa)]/70">{vidFile.name} ({(vidFile.size / 1024 / 1024).toFixed(1)} MB)</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--cocoa)]">Imagem de capa (opcional)</label>
            {videoModal.editing && vidThumb && !vidThumbFile && (
              <img src={vidThumb} alt="Thumb atual" className="mb-1 max-h-24 rounded-md object-cover" />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setVidThumbFile(e.currentTarget.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground"
            />
            {vidThumbFile && <p className="text-xs text-[var(--cocoa)]/70">{vidThumbFile.name}</p>}
          </div>

          <NumberInput label="Ordem" value={vidOrder} onChange={setVidOrder} min={0} />
          <Button fullWidth onClick={saveVideo} disabled={uploading} loading={uploading} className="mt-2 bg-gradient-luxe">
            {uploading ? "Enviando..." : "Salvar"}
          </Button>
        </div>
      </Modal>

      {/* Admin: Services Modal */}
      <Modal
        opened={servicesModalOpen}
        onClose={() => setServicesModalOpen(false)}
        title={<span className="font-display text-lg">Gerenciar serviços</span>}
        centered radius="lg" size="lg"
      >
        <div className="grid gap-4 md:grid-cols-2">
          {/* List */}
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {services.length === 0 && <p className="text-xs text-gray-500">Nenhum serviço ainda.</p>}
            {services.map((s) => (
              <div key={s.id} className={`rounded-lg border p-3 text-sm ${editingService?.id === s.id ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{s.name}</p>
                    <p className="text-[11px] text-gray-500">{s.duration_min} min · R$ {Number(s.price).toFixed(2)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditService(s)} className="grid h-7 w-7 place-items-center rounded-full border hover:bg-gray-50" title="Editar"><Edit2 className="h-3 w-3" /></button>
                    <button onClick={() => deleteService(s.id)} className="grid h-7 w-7 place-items-center rounded-full border border-red-300 text-red-600 hover:bg-red-50" title="Excluir"><Trash2 className="h-3 w-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-2 border-l md:pl-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{editingService ? "Editar serviço" : "Novo serviço"}</p>
              {editingService && (
                <button onClick={resetServiceForm} className="text-xs text-gray-500 hover:text-gray-900 inline-flex items-center gap-1"><X className="h-3 w-3" /> Cancelar</button>
              )}
            </div>
            <TextInput label="Título" value={svcName} onChange={(e) => setSvcName(e.currentTarget.value)} required size="xs" />
            <Textarea label="Descrição" value={svcDesc} onChange={(e) => setSvcDesc(e.currentTarget.value)} rows={2} size="xs" />
            <NumberInput label="Duração (min)" value={svcDuration} onChange={setSvcDuration} min={1} size="xs" />
            <NumberInput label="Preço (R$)" value={svcPrice} onChange={setSvcPrice} min={0} decimalScale={2} fixedDecimalScale size="xs" />
            <NumberInput label="Ordem" value={svcOrder} onChange={setSvcOrder} min={0} size="xs" />
            <Button fullWidth onClick={saveService} className="mt-2 bg-gradient-luxe" size="sm">{editingService ? "Atualizar" : "Adicionar"}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
