## Ajustes solicitados

### 1. Trocar localização São Paulo → Florianópolis
Substituir todas as menções de "São Paulo" / "SP" por "Florianópolis" / "Florianópolis - Itacorubi" nos arquivos:
- `src/components/site-footer.tsx` (rodapé: "São Paulo, SP")
- `src/routes/index.tsx` (badge do hero: "Estúdio em São Paulo")
- Buscar com `rg "São Paulo|SP"` para garantir cobertura em outros arquivos (cursos, agendamentos, admin, metadados og).

### 2. Substituir o ícone Sparkles (estrela tipo Gemini) por uma logo própria
Hoje o `Sparkles` da lucide-react é usado em:
- `src/components/site-header.tsx` (logo do header)
- `src/routes/index.tsx` (badge "Estúdio em ...")

Plano:
- Criar um componente `src/components/brand-mark.tsx` com um SVG inline próprio — um monograma "A" elegante combinado a um elemento que remete a unha/gota/lima, usando a paleta marsala + bege. Estilo flat, geométrico, alto contraste, reconhecível em tamanhos pequenos (como Chrome/Pepsi).
- Conceito: um círculo marsala com um "A" serifado em bege ao centro e uma curva sutil formando o contorno de uma unha na parte superior. Sem traços finos demais (legível embaçado).
- Trocar os usos do `<Sparkles />` por `<BrandMark />` no header (no círculo de fundo) e no badge do hero (versão monocromática pequena).
- Gerar também `public/favicon.svg` com o mesmo símbolo e referenciá-lo em `__root.tsx` (links `icon` e `apple-touch-icon`).
- Remover imports não usados de `Sparkles` após a troca.

A logo será desenhada como SVG no código (não imagem gerada), garantindo nitidez em qualquer tamanho.

### 3. Remover o badge "Edit with Lovable"
Usar a configuração nativa de publicação: chamar `publish_settings--set_badge_visibility` com `hide_badge: true`. Esta é a forma suportada (requer plano Pro+). Não há como removê-lo via CSS no código do projeto porque ele é injetado pelo runtime de publicação após o build.

Se o plano atual não permitir, eu aviso e o badge permanece — não há alternativa técnica dentro do código-fonte.

### Verificação final
- `rg "São Paulo|Sparkles"` deve retornar vazio em `src/`.
- Header e hero renderizam a nova marca.
- Confirmar visualmente no preview.
