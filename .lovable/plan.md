## Nova seção "Marketplace" com produtos gerenciáveis pelo admin

### 1. Banco de dados
Criar tabela `products` no backend com:
- nome
- descrição
- foto (URL da imagem)
- preço
- link externo (para onde o cliente é direcionado ao clicar)
- ordem de exibição

Regras de acesso:
- Qualquer visitante pode visualizar os produtos.
- Apenas administradores podem criar, editar ou excluir produtos.

Criar bucket de storage `product-images` (privado, com leitura pública via política) para upload das fotos dos produtos pelo admin.

### 2. Nova rota pública `/marketplace`
- Adicionar link "Marketplace" no header e footer ao lado de "Cursos" e "Agendamentos".
- Página lista todos os produtos em formato de grid (card com foto, nome, descrição curta e preço).
- Ao clicar em qualquer card, abre o link externo cadastrado em nova aba.
- Meta tags próprias (title, description, og:title, og:description) para SEO.
- Atualização em tempo real via Supabase Realtime (mesmo padrão já usado em vídeos/seções).

### 3. Painel administrativo (`/admin`)
Adicionar nova aba/seção "Produtos" com:
- Botão **"Adicionar produto"** que abre um modal com os campos:
  - Nome (texto)
  - Descrição (textarea)
  - Foto (upload de imagem para o bucket `product-images`)
  - Preço (número, em R$)
  - Link de destino (URL — para onde o cliente será encaminhado ao clicar)
- Lista dos produtos cadastrados com botões **Editar** e **Excluir** em cada item.
- Modal de edição reaproveita o mesmo formulário.
- Exclusão e edição refletem em tempo real na listagem (sem precisar recarregar a página), seguindo o padrão já corrigido para vídeos/seções.

### 4. Componentes novos
- `src/routes/marketplace.tsx` — página pública do marketplace.
- `src/components/admin/products-manager.tsx` — gerenciamento na área admin.
- `src/components/admin/product-form-dialog.tsx` — modal de criação/edição.

### Detalhes técnicos
- Tabela `public.products` com RLS: `SELECT` liberado a `anon`/`authenticated`; `INSERT`/`UPDATE`/`DELETE` apenas para `has_role(auth.uid(), 'admin')`.
- Bucket `product-images` privado com política de leitura pública em `storage.objects` e política de escrita/exclusão restrita a admins.
- Realtime: `supabase.channel('products').on('postgres_changes', ...)` invalidando a query do React Query, igual ao padrão atual.
- Tipos do Supabase serão regenerados após a migração aprovada antes de escrever o código que consome a tabela.

### Pontos que NÃO serão alterados
- UI, fluxo e funcionalidades existentes de Cursos, Agendamentos, Auth e Admin permanecem intactos — apenas adições.
