import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, Send, ThumbsUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/cursos/$videoId")({
  component: VideoPage,
});

function VideoPage() {
  const { videoId } = Route.useParams();
  const nav = useNavigate();
  const [session, setSession] = useState<any>(null);
  const [video, setVideo] = useState<any>(null);
  const [section, setSection] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      nav({ to: "/cursos" });
      return;
    }
    setSession(session);

    // Check subscription / admin status — block direct URL access if unpaid
    const [profileRes, subRes, rolesRes] = await Promise.all([
      supabase.from('profiles').select('role').eq('id', session.user.id).maybeSingle(),
      supabase.from('subscriptions').select('is_active, expires_at').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('user_roles').select('role').eq('user_id', session.user.id),
    ]);
    const isAdmin = profileRes.data?.role === 'admin'
      || (rolesRes.data || []).some((r: any) => r.role === 'admin');
    const sub = subRes.data;
    const subActive = sub?.is_active && (!sub.expires_at || new Date(sub.expires_at) > new Date());
    if (!isAdmin && !subActive) {
      nav({ to: "/cursos", search: { paywall: "1" } as any });
      return;
    }

    // Load video and its section
    const { data: videoData } = await supabase
      .from('videos')
      .select('*, sections(*)')
      .eq('id', videoId)
      .single();

    if (!videoData) {
      setLoading(false);
      return;
    }

    setVideo(videoData);
    setSection(videoData.sections);

    // Load comments
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*')
      .eq('video_id', videoId)
      .order('created_at', { ascending: false });

    setComments(commentsData || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    const channel = supabase
      .channel(`video-${videoId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: `video_id=eq.${videoId}` }, (payload) => {
        setComments(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [videoId]);

  const submitComment = async () => {
    if (!text.trim() || !session) return;

    const { error } = await supabase.from('comments').insert([
      {
        video_id: videoId,
        user_id: session.user.id,
        author_name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0],
        content: text
      }
    ]);

    if (error) {
      toast.error("Erro ao enviar comentário");
    } else {
      setText("");
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--cocoa)] text-[var(--sand)]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!video) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center text-[var(--sand)]">
        <p>Vídeo não encontrado.</p>
        <button onClick={() => nav({ to: "/cursos" })} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Voltar</button>
      </div>
    );
  }

  return (
    <div className="bg-[var(--cocoa)] min-h-screen pb-16 text-[var(--sand-soft)]">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link to="/cursos" className="inline-flex items-center gap-2 text-sm text-[var(--sand)]/70 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar para os cursos
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-luxury">
          <video 
            key={video.id} 
            src={video.video_url} 
            poster={video.thumbnail_url} 
            controls 
            playsInline 
            className="aspect-video w-full bg-black" 
          />
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">{section?.title}</p>
          <h1 className="mt-1 font-display text-3xl md:text-4xl">{video.title}</h1>
          <p className="mt-2 text-sm text-[var(--sand)]/80">{video.description}</p>
        </div>

        {/* Comments */}
        <section className="mt-10">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-display text-xl">Comentários ({comments.length})</h2>
          </div>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {(session?.user?.email?.[0] || "A").toUpperCase()}
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Compartilhe sua opinião..."
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-[var(--sand)]/40 text-[var(--sand)]"
            />
            <button 
              onClick={submitComment} 
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50 transition-all hover:scale-105" 
              disabled={!text.trim()}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>

          <ul className="mt-6 space-y-5">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--olive)] text-xs font-semibold text-white">
                  {(c.author_name?.[0] || 'U').toUpperCase()}
                </span>
                <div>
                  <p className="text-sm">
                    <strong>{c.author_name}</strong> 
                    <span className="text-[var(--sand)]/50 ml-2">• {new Date(c.created_at).toLocaleDateString()}</span>
                  </p>
                  <p className="mt-1 text-sm text-[var(--sand)]/90">{c.content}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
