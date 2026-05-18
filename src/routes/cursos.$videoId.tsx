import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, MessageCircle, Send, ThumbsUp } from "lucide-react";
import { sections } from "@/lib/courses/data";
import { useSession } from "@/lib/auth-mock";

export const Route = createFileRoute("/cursos/$videoId")({
  component: VideoPage,
});

type Comment = { id: string; author: string; text: string; createdAt: string; likes: number };

function VideoPage() {
  const { videoId } = Route.useParams();
  const nav = useNavigate();
  const session = useSession();
  const video = sections.flatMap((s) => s.videos).find((v) => v.id === videoId);
  const section = sections.find((s) => s.videos.some((v) => v.id === videoId));
  const [comments, setComments] = useState<Comment[]>([
    { id: "c1", author: "Marina S.", text: "Aula impecável! Já apliquei na minha cliente.", createdAt: "há 2 dias", likes: 12 },
    { id: "c2", author: "Camila P.", text: "Adoro a didática. Pode fazer um vídeo sobre limpeza profunda?", createdAt: "há 5 dias", likes: 8 },
  ]);
  const [text, setText] = useState("");

  if (!video || !section) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <p>Vídeo não encontrado.</p>
        <button onClick={() => nav({ to: "/cursos" })} className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">Voltar</button>
      </div>
    );
  }

  const submit = () => {
    if (!text.trim()) return;
    setComments((c) => [{ id: crypto.randomUUID(), author: session?.email.split("@")[0] || "Anônima", text, createdAt: "agora", likes: 0 }, ...c]);
    setText("");
  };

  return (
    <div className="bg-[var(--cocoa)] pb-16 text-[var(--sand-soft)]">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link to="/cursos" className="inline-flex items-center gap-2 text-sm text-[var(--sand)]/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Voltar para os cursos
        </Link>
      </div>

      <div className="mx-auto max-w-5xl px-4">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-luxury">
          <video key={video.id} src={video.src} poster={video.thumbnail} controls playsInline className="aspect-video w-full bg-black" />
        </div>

        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.25em] text-primary">{section.name}</p>
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
              {(session?.email[0] || "A").toUpperCase()}
            </span>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Compartilhe sua opinião..."
              rows={2}
              className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-[var(--sand)]/40"
            />
            <button onClick={submit} className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground disabled:opacity-50" disabled={!text.trim()}>
              <Send className="h-4 w-4" />
            </button>
          </div>

          <ul className="mt-6 space-y-5">
            {comments.map((c) => (
              <li key={c.id} className="flex gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--olive)] text-xs font-semibold text-[var(--olive-foreground)]">
                  {c.author[0]}
                </span>
                <div>
                  <p className="text-sm"><strong>{c.author}</strong> <span className="text-[var(--sand)]/50">• {c.createdAt}</span></p>
                  <p className="mt-1 text-sm text-[var(--sand)]/90">{c.text}</p>
                  <button className="mt-1.5 inline-flex items-center gap-1 text-xs text-[var(--sand)]/60 hover:text-white">
                    <ThumbsUp className="h-3.5 w-3.5" /> {c.likes}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
