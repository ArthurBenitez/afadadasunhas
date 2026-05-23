## Plano de mudanças

### 1. Remover link "Área Administrativa" do footer
- **Arquivo:** `src/components/site-footer.tsx`
- **Mudança:** Excluir a linha do link "Área Administrativa" na seção de navegação do footer.

### 2. Corrigir marca de "Afada" para "A fada das unhas"
- **Arquivo:** `src/components/site-footer.tsx`
  - Título: `afada das unhas` → `a fada das unhas`
  - Copyright: `Afada das Unhas` → `A fada das Unhas`
- **Arquivo:** `src/components/site-header.tsx`
  - Logo: `afada.` → `a fada.`
- **Arquivo:** `src/components/brand-mark.tsx`
  - Comentário e title: `Afada das Unhas` → `A fada das Unhas`
- **Arquivo:** `src/routes/index.tsx`
  - Meta tags: `Afada das Unhas` → `A fada das Unhas`
- **Arquivo:** `src/routes/__root.tsx`
  - Meta tags: `Afada das Unhas` → `A fada das Unhas`
- **Arquivo:** `src/routes/cursos.tsx`
  - Meta tags: `Afada das Unhas` → `A fada das Unhas`
- **Arquivo:** `src/routes/agendamentos.tsx`
  - Meta tags: `Afada das Unhas` → `A fada das Unhas`
- **Arquivo:** `src/routes/admin.tsx`
  - Título: `Afada das Unhas` → `A fada das Unhas`
- **Arquivo:** `src/routes/cursos.index.tsx`
  - Textos visíveis: `Afada das Unhas` → `A fada das Unhas`

**Nota:** E-mails (`contato@afadadasunhas.com`), handles do Instagram (`@afadadasunhas`) e chaves internas de localStorage (`afada_session`) não serão alterados, pois não são o nome da marca em exibição.