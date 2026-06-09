## Objetivo

Permitir gerenciar produtos do /marketplace diretamente da página de Cursos quando logada como admin.

## O que será feito

1. Na página `/cursos`, detectar se o usuário logado tem role `admin` (mesma lógica usada em `/admin`).
2. Quando for admin, exibir no topo da página:
   - Botão **"Adicionar Produto"**.
   - Logo abaixo, uma lista compacta dos produtos já cadastrados (foto, nome, preço) com ações **Editar** e **Excluir** em cada item.
3. Reaproveitar o mesmo modal de produto que já existe em `/admin` (nome, descrição, foto, preço, link de destino, ordem), com as mesmas validações e mesma escrita na tabela `products`.
4. Sincronizar a lista em tempo real via canal Supabase (mesmo padrão já usado).
5. Usuárias não-admin continuam vendo a página de Cursos exatamente como hoje — nenhuma alteração visual ou funcional para elas.

## Detalhes técnicos

- Extrair o formulário/modal de produto de `src/routes/admin.tsx` para um componente reutilizável `src/components/product-form-modal.tsx`, e usar tanto em `/admin` quanto em `/cursos` (sem mudar comportamento atual do /admin).
- Em `src/routes/cursos.tsx` (ou no leaf `cursos.index.tsx`, onde fica o cabeçalho), adicionar bloco condicional `profile?.role === 'admin'` com: botão "Adicionar Produto" + grid/lista enxuta de produtos com botões Editar/Excluir (mesmas chamadas `supabase.from('products')`).
- Subscription realtime em `products` apenas montada quando admin.
- Nenhuma mudança em RLS, schema ou em `/marketplace`.