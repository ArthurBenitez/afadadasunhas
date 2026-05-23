import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calendar, FilmIcon, MessageSquare, ShieldAlert, Plus, Edit2, Trash2, Upload, Loader2, X } from "lucide-react";
import { Tabs, Modal, TextInput, Textarea, Button, NumberInput, Group } from "@mantine/core";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/booking/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Painel Administrativo — A fada das Unhas" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const navigate = useNavigate();

  // Modal states
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);

  // Form states
  const [sectionTitle, setSectionTitle] = useState("");
  const [sectionDesc, setSectionDesc] = useState("");
  const [sectionOrder, setSectionOrder] = useState(0);

  const [videoTitle, setVideoTitle] = useState("");
  const [videoDesc, setVideoDesc] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumb, setVideoThumb] = useState("");
  const [videoOrder, setVideoOrder] = useState(0);

  const loadInitialData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate({ to: "/cursos" });
      return;
    }
    setSession(session);

    const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
    if (!profile || profile.role !== 'admin') {
      setLoading(false);
      return;
    }
    setProfile(profile);

    // Load content
    const [secRes, comRes] = await Promise.all([
      supabase.from('sections').select('*, videos(*)').order('order', { ascending: true }),
      supabase.from('comments').select('*').order('created_at', { ascending: false }).limit(20)
    ]);

    setSections(secRes.data || []);
    setComments(comRes.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData();
    
    const channel = supabase
      .channel('admin-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sections' }, loadInitialData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'videos' }, loadInitialData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, loadInitialData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleSaveSection = async () => {
    if (!sectionTitle) return;
    
    const sectionData = {
      title: sectionTitle,
      description: sectionDesc,
      order: sectionOrder
    };

    let error;
    if (editingSection) {
      const res = await supabase.from('sections').update(sectionData).eq('id', editingSection.id);
      error = res.error;
    } else {
      const res = await supabase.from('sections').insert([sectionData]);
      error = res.error;
    }

    if (error) {
      toast.error("Erro ao salvar seção");
    } else {
      toast.success(editingSection ? "Seção atualizada" : "Seção criada");
      setSectionModalOpen(false);
      setEditingSection(null);
      setSectionTitle("");
      setSectionDesc("");
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta seção e todos os seus vídeos?")) return;
    const { error } = await supabase.from('sections').delete().eq('id', id);
    if (error) toast.error("Erro ao excluir");
    else toast.success("Seção excluída");
  };

  const handleSaveVideo = async () => {
    if (!videoTitle || !videoUrl || !currentSectionId) return;
    
    const videoData = {
      section_id: currentSectionId,
      title: videoTitle,
      description: videoDesc,
      video_url: videoUrl,
      thumbnail_url: videoThumb,
      order: videoOrder
    };

    const { error } = await supabase.from('videos').insert([videoData]);

    if (error) {
      toast.error("Erro ao salvar vídeo");
    } else {
      toast.success("Vídeo adicionado");
      setVideoModalOpen(false);
      setVideoTitle("");
      setVideoDesc("");
      setVideoUrl("");
      setVideoThumb("");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile || profile.role !== 'admin') {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/15 text-destructive">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 font-display text-3xl text-foreground">Acesso restrito</h1>
        <p className="mt-2 text-muted-foreground">É necessário entrar com uma conta de administrador.</p>
        <Link to="/cursos" className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground">
          Voltar para Cursos
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Painel administrativo</p>
          <h1 className="mt-1 font-display text-4xl text-foreground md:text-5xl">Olá, {profile.full_name || 'Admin'}</h1>
          <p className="mt-2 text-muted-foreground">Gerencie seu império de unhas em tempo real.</p>
        </div>
        <button onClick={() => {
          setEditingSection(null);
          setSectionTitle("");
          setSectionDesc("");
          setSectionOrder(sections.length);
          setSectionModalOpen(true);
        }} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-luxury">
          <Plus size={18} /> Nova Seção
        </button>
      </header>

      <Tabs defaultValue="courses" mt="xl" variant="pills" radius="md">
        <Tabs.List grow>
          <Tabs.Tab value="courses" leftSection={<FilmIcon size={16} />}>Cursos / Netflix</Tabs.Tab>
          <Tabs.Tab value="comments" leftSection={<MessageSquare size={16} />}>Comentários</Tabs.Tab>
          <Tabs.Tab value="bookings" leftSection={<Calendar size={16} />}>Agendamentos (Mock)</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="courses" pt="lg">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((sec) => (
              <article key={sec.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:shadow-luxury">
                <div className="relative h-40 w-full overflow-hidden bg-muted">
                  <img 
                    src={sec.cover_url || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1000&auto=format&fit=crop"} 
                    alt={sec.title} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button 
                      onClick={() => {
                        setEditingSection(sec);
                        setSectionTitle(sec.title);
                        setSectionDesc(sec.description || "");
                        setSectionOrder(sec.order);
                        setSectionModalOpen(true);
                      }}
                      className="p-2 rounded-full bg-white/90 text-foreground hover:bg-white"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDeleteSection(sec.id)}
                      className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-xl text-foreground">{sec.title}</h3>
                    <span className="text-[10px] font-bold uppercase text-primary">Ordem: {sec.order}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{sec.description || "Sem descrição"}</p>
                  
                  <div className="mt-4 border-t border-border pt-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{sec.videos?.length || 0} Vídeos</p>
                    <div className="mt-2 space-y-1">
                      {sec.videos?.sort((a: any, b: any) => a.order - b.order).slice(0, 3).map((v: any) => (
                        <div key={v.id} className="flex items-center justify-between text-xs text-foreground">
                          <span className="truncate flex-1">• {v.title}</span>
                          <span className="text-[10px] text-muted-foreground ml-2">#{v.order}</span>
                        </div>
                      ))}
                      {(sec.videos?.length || 0) > 3 && (
                        <p className="text-[10px] text-primary font-medium">+ {sec.videos.length - 3} outros</p>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      setCurrentSectionId(sec.id);
                      setVideoModalOpen(true);
                    }}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                  >
                    <Upload size={14} /> Adicionar Vídeo
                  </button>
                </div>
              </article>
            ))}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="comments" pt="lg">
          <div className="space-y-3">
            {comments.length > 0 ? comments.map((c) => (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>De: <strong className="text-foreground">{c.author_name || 'Usuária'}</strong></span>
                  <span>{new Date(c.created_at).toLocaleString()}</span>
                </div>
                <p className="mt-2 text-sm text-foreground">{c.content}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">No vídeo: {c.video_id}</span>
                </div>
              </div>
            )) : (
              <div className="py-20 text-center">
                <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/30" />
                <p className="mt-2 text-muted-foreground">Nenhum comentário recente.</p>
              </div>
            )}
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="bookings" pt="lg">
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground/20" />
            <p className="mt-4 text-muted-foreground italic">Módulo de agendamentos reais em desenvolvimento...</p>
          </div>
        </Tabs.Panel>
      </Tabs>

      {/* Section Modal */}
      <Modal 
        opened={sectionModalOpen} 
        onClose={() => setSectionModalOpen(false)} 
        title={<span className="font-display text-xl">{editingSection ? "Editar Seção" : "Nova Seção"}</span>}
        centered
        radius="lg"
      >
        <div className="space-y-4">
          <TextInput label="Título da Seção" placeholder="Ex: Anatomia das Unhas" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} required />
          <Textarea label="Descrição" placeholder="Uma breve descrição sobre o que será ensinado nesta seção." value={sectionDesc} onChange={(e) => setSectionDesc(e.target.value)} rows={3} />
          <NumberInput label="Ordem de Exibição" value={sectionOrder} onChange={(v) => setSectionOrder(Number(v))} min={0} />
          <Button fullWidth onClick={handleSaveSection} className="mt-4 bg-primary">Salvar Seção</Button>
        </div>
      </Modal>

      {/* Video Modal */}
      <Modal 
        opened={videoModalOpen} 
        onClose={() => setVideoModalOpen(false)} 
        title={<span className="font-display text-xl">Adicionar Vídeo à Seção</span>}
        centered
        radius="lg"
      >
        <div className="space-y-4">
          <TextInput label="Título do Vídeo" placeholder="Ex: Preparação de Lâmina" value={videoTitle} onChange={(e) => setVideoTitle(e.target.value)} required />
          <Textarea label="Descrição" placeholder="O que é abordado neste vídeo?" value={videoDesc} onChange={(e) => setVideoDesc(e.target.value)} rows={3} />
          <TextInput label="URL do Vídeo" placeholder="https://..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} required description="Link direto para o arquivo de vídeo MP4 ou similar." />
          <TextInput label="URL da Thumbnail (Capa)" placeholder="https://..." value={videoThumb} onChange={(e) => setVideoThumb(e.target.value)} description="Deixe em branco para usar uma padrão." />
          <NumberInput label="Ordem" value={videoOrder} onChange={(v) => setVideoOrder(Number(v))} min={0} />
          <Button fullWidth onClick={handleSaveVideo} className="mt-4 bg-primary">Adicionar Vídeo</Button>
        </div>
      </Modal>
    </div>
  );
}
