## Resumo
Inserir uma nova seção "Produtos" na home page, posicionada entre a seção de Serviços e a seção de Destaque Cursos (Plataforma aulas exclusivas). A seção exibirá até 4 produtos cadastrados na tabela `products`, com cards que mostram imagem, nome, preço e link para compra/ver oferta.

## Escopo
- Somente a página inicial (`src/routes/index.tsx`)
- Nenhuma alteração em rotas, banco de dados, autenticação ou outros fluxos existentes
- Os produtos já estão cadastrados na tabela `products`; basta consumi-los

## O que será feito

1. **Buscar produtos na home**
   - Adicionar estado `products` no componente `HomePage`
   - Buscar até 4 registros da tabela `products` via Supabase, ordenados pelo campo `order` (crescente)
   - Carregamento simples; se não houver produtos, a seção não aparece (ou mostra estado vazio discreto)

2. **Nova seção de Produtos**
   - Local exato: entre a seção `SERVIÇOS` e a seção `DESTAQUE CURSOS`
   - Layout:
     - Cabeçalho com label "Produtos", título e descrição curta
     - Grid de cards (máximo 4 colunas em desktop, 2 em tablet, 1 em mobile)
     - Cada card mostra:
       - Imagem do produto (aspect-square, cobertura total)
       - Nome do produto
       - Preço formatado em BRL
       - Badge/link "Ver oferta" que redireciona para `external_url` (abre em nova aba)
     - Botão/link no final: "Ver todos os produtos" apontando para `/marketplace`

3. **Estilo visual**
   - Manter a paleta e tokens existentes (bege, primary, card, border)
   - Usar `motion` (Framer Motion) para entrada animada dos cards, no mesmo padrão das outras seções (`fadeUp`, `whileInView`)
   - Cards arredondados (`rounded-2xl`), borda sutil, sombra suave (`shadow-soft`) e efeito hover (`hover:-translate-y-1`)
   - Tipografia com `font-display` para títulos e preços

## Não será alterado
- Marketplace (`/marketplace`) permanece inalterado
- Painel de cursos e CRUD de produtos permanecem inalterados
- Serviços, Cursos, CTA final e Hero da home permanecem inalterados