## Problema
O link salvo (ex: `youtube.com`) é tratado como caminho relativo pelo `<a href>`, então o clique vai para `/youtube.com` em vez do site externo.

## Correção
Em `src/routes/marketplace.tsx`, normalizar `external_url` antes de usar no `href`:

```ts
const toAbsolute = (url: string) =>
  /^https?:\/\//i.test(url) ? url : `https://${url}`;
```

Usar `href={toAbsolute(p.external_url)}` no `<motion.a>` do card "Ver oferta".

Adicionalmente, em `src/routes/cursos.index.tsx`, aplicar a mesma normalização ao salvar o produto (`prodLink`) dentro de `saveProduct`, para que produtos novos/editados já sejam gravados com `https://`.

Nenhuma outra UI, rota ou fluxo é alterado.