import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

const mantineTheme = createTheme({
  primaryColor: "marsala",
  fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
  headings: { fontFamily: "Cormorant Garamond, ui-serif, Georgia, serif" },
  defaultRadius: "md",
  colors: {
    marsala: [
      "#fbeaee", "#f0c2c9", "#e29aa4", "#d27280", "#c14a5d",
      "#a8324a", "#84263a", "#640017", "#480010", "#2e0009",
    ],
    olive: [
      "#f4f4e3", "#e0e1bb", "#cccd93", "#b8b86b", "#a4a544",
      "#8a8b32", "#6f7029", "#5A5E27", "#43461c", "#2d2f12",
    ],
  },
});

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Página não encontrada</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Voltar para a home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">Tente recarregar a página.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Tentar novamente
          </button>
          <a href="/" className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            Home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#640017" },
      { title: "Afada das Unhas — Cursos, Beleza e Cuidado" },
      { name: "description", content: "Nail design de unhas em Florianópolis - Itacorubi. Agende seu horário ou inscreva-se nos cursos exclusivos." },
      { name: "author", content: "Afada das Unhas" },
      { property: "og:title", content: "Afada das Unhas — Cursos, Beleza e Cuidado" },
      { property: "og:description", content: "Nail design de unhas em Florianópolis - Itacorubi. Agende seu horário ou inscreva-se nos cursos exclusivos." },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Afada das Unhas" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Afada das Unhas — Cursos, Beleza e Cuidado" },
      { name: "twitter:description", content: "Nail design de unhas em Florianópolis - Itacorubi. Agende seu horário ou inscreva-se nos cursos exclusivos." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b8ad1fa5-d2ea-46f4-a6c7-d277113bfe01" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/b8ad1fa5-d2ea-46f4-a6c7-d277113bfe01" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={mantineTheme} defaultColorScheme="light">
        <Notifications position="top-right" zIndex={2000} />
        <div className="flex min-h-screen flex-col bg-background text-foreground">
          <SiteHeader />
          <main className="flex-1">
            <Outlet />
          </main>
          <SiteFooter />
        </div>
      </MantineProvider>
    </QueryClientProvider>
  );
}
