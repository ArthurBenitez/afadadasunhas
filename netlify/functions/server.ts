import type { Context } from "@netlify/functions";

let serverFetch: ((req: Request) => Promise<Response>) | null = null;

async function initServer() {
  if (!serverFetch) {
    try {
      const mod = await import("../dist/server/index.js");
      serverFetch = mod.default?.fetch || mod.fetch;
    } catch {
      // Fallback - não encontrou o servidor, retorna um erro
      serverFetch = () =>
        Promise.resolve(new Response("Server not initialized", { status: 500 }));
    }
  }
  return serverFetch;
}

export default async (req: Request, context: Context) => {
  try {
    const fetch = await initServer();
    if (!fetch) {
      return new Response("Server handler not available", { status: 503 });
    }

    // Adapta a requisição para o formato esperado
    const response = await fetch(req);
    return response;
  } catch (error) {
    console.error("Server error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
};
