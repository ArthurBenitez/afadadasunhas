import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/booking/data";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Produtos — A fada das Unhas" },
      { name: "description", content: "Produtos selecionados pela A fada das Unhas para profissionais e amantes da manicure." },
      { property: "og:title", content: "Produtos — A fada das Unhas" },
      { property: "og:description", content: "Produtos selecionados pela A fada das Unhas." },
      { property: "og:url", content: "/marketplace" },
    ],
    links: [{ rel: "canonical", href: "/marketplace" }],
  }),
  component: MarketplacePage,
});

type Product = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  price: number;
  external_url: string;
  order: number;
};

function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("order", { ascending: true })
      .order("created_at", { ascending: false });
    setProducts((data as Product[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel("public-products")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, load)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <motion.header
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <ShoppingBag className="h-3.5 w-3.5" /> Produtos
        </span>
        <h1 className="mt-4 font-display text-4xl text-foreground md:text-5xl">
          Nossos produtos favoritos
        </h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Itens cuidadosamente selecionados pela A fada das Unhas. Clique no produto para finalizar a compra.
        </p>
      </motion.header>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <ShoppingBag className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-3 text-muted-foreground">Em breve novos produtos por aqui.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <motion.a
              key={p.id}
              href={p.external_url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.04 }}
              className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:shadow-luxury"
            >
              <div className="relative aspect-square w-full overflow-hidden bg-muted">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full w-full place-items-center text-muted-foreground/30">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                )}
                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
                  Ver oferta <ExternalLink className="h-3 w-3" />
                </div>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h2 className="font-display text-lg text-foreground">{p.name}</h2>
                {p.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between pt-4">
                  <span className="font-display text-xl text-primary">{brl(Number(p.price))}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Comprar
                  </span>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      )}
    </div>
  );
}