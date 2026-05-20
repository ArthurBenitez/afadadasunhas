## Plano de ajustes

### 1. Resetar senha do admin
- Atualizar a senha do usuário `admin@afadadasunhas.com.br` para `#@tralalerotralala33sahurz&` via update direto em `auth.users` (usando `crypt()` + `gen_salt('bf')`) através de uma migration administrativa.

### 2. Reestruturar gating de pagamento em `/cursos`

**Comportamento atual:** popup aparece imediatamente ao entrar em `/cursos` se a assinatura estiver inativa, bloqueando toda navegação.

**Novo comportamento:**
- Ao entrar em `/cursos`, o usuário vê normalmente todas as seções e thumbnails dos vídeos — sem popup.
- O clique em qualquer card de vídeo é interceptado:
  - Se `subscription.is_active = true` (ou `role = admin`) → navega para `/cursos/$videoId` normalmente.
  - Se inativo → abre popup com animação (Mantine Modal já existe; adicionar `transitionProps` com `transition: 'pop'` + `framer-motion` no conteúdo interno para fade/scale suave).
- Como reforço de segurança, a rota `/cursos/$videoId` também verifica a assinatura no carregamento e redireciona para `/cursos` (abrindo o popup via query param `?paywall=1`) caso o usuário tente acessar diretamente pela URL.

### 3. Fluxo simulado de pagamento

- Botão **"Ir para o pagamento"** dentro do popup deixa de apenas mostrar um toast.
- Ao clicar:
  1. Faz `update` em `subscriptions` para o usuário logado:
     - `is_active = true`
     - `expires_at = now() + interval '1 month'` (timestamp preciso para validade mensal)
     - `updated_at = now()`
  2. Fecha o popup de paywall.
  3. Abre um segundo popup (ou troca o conteúdo do mesmo) com animação de sucesso (ícone check + texto "Pagamento confirmado! Acesso liberado até DD/MM/AAAA").
  4. Recarrega o estado local de `subscription` para que cliques subsequentes em vídeos funcionem imediatamente sem refresh.

### 4. Validade mensal (timestamp)
- Toda checagem de "está pago" passa a considerar: `is_active = true` **E** (`expires_at IS NULL OR expires_at > now()`).
- Isso vale tanto no frontend (gating do clique) quanto pode ser reforçado depois via RLS/policy se desejar — nesta iteração só ajusto o frontend para manter o escopo mínimo.

### Arquivos afetados
- `supabase/migrations/<novo>.sql` — reset de senha do admin (uma única migration administrativa).
- `src/routes/cursos.index.tsx` — remove popup automático, adiciona interceptação de clique, popup com animação, fluxo de pagamento simulado e popup de confirmação.
- `src/routes/cursos.$videoId.tsx` — adiciona checagem de assinatura ativa antes de renderizar o player; redireciona para `/cursos?paywall=1` se não pago.

### O que NÃO muda
- Layout, design, header, hero, carrosséis, comentários, área admin, agendamentos, autenticação, RLS, seed de vídeos — tudo permanece intacto.
