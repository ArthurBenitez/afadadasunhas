## Diagnóstico

Investiguei o fluxo atual em `src/routes/cursos.index.tsx` + `src/routes/cursos.$videoId.tsx` e o estado do banco. Encontrei 3 causas reais que explicam por que o popup não aparece ao clicar no módulo:

1. **`<Link>` do TanStack Router não bloqueia confiavelmente a navegação via `e.preventDefault()` no `onClick`**. Em muitos casos a navegação client-side acontece mesmo assim — então o clique sai de `/cursos` e vai direto para `/cursos/$videoId`. Lá o componente faz `window.location.href = "/cursos?paywall=1"`, gerando um *full reload* — e o popup pode falhar em aparecer dependendo do timing do `useEffect` vs. a leitura do `URLSearchParams`.

2. **Usuário atual provavelmente está logado como admin** (`admin@afadadasunhas.com.br`) — no banco a conta tem `is_active = true` e `expires_at = 2036`. Para essa conta o comportamento correto **é** não mostrar popup. Se o teste estiver sendo feito com essa conta, o popup nunca vai aparecer (e isso é correto).

3. **Verificação de admin no frontend usa `profile?.role`**, mas a conta admin tem `profiles.role = NULL` (a role real vive em `user_roles`). Hoje só funciona porque a assinatura está ativa. Se a assinatura expirar, o admin perde acesso indevidamente. Vou corrigir.

## Plano de correção

### 1. Trocar `<Link>` por elemento clicável controlado nos cards de vídeo
Em `src/routes/cursos.index.tsx`, os cards de vídeo (hero + carrosséis) deixam de ser `<Link>` e passam a ser `<button>` / `<div role="button">`. O handler único decide:
- se assinatura ativa → `navigate({ to: "/cursos/$videoId", params: { videoId } })`
- se inativa → `setShowPaymentModal(true)` (popup com animação aparece imediatamente, sem navegação alguma)

Isso elimina a corrida com a navegação do TanStack Link e garante o popup 100% das vezes.

### 2. Corrigir verificação de admin
Em vez de `profile?.role === 'admin'`, carregar também `user_roles` (`supabase.from('user_roles').select('role').eq('user_id', session.user.id)`) e considerar admin se existir linha com `role = 'admin'`. Atualizar `isSubscriptionActive(sub, isAdmin)` para receber esse boolean.

Aplicar o mesmo em `src/routes/cursos.$videoId.tsx` (a verificação de bloqueio direto via URL).

### 3. Fallback de assinatura ausente
Se `subscriptions` retornar `null` (usuário antigo sem linha), tratar como **inativo** (já é o comportamento, mas explicitar com `?? null` para evitar warnings) e disparar popup ao clicar.

### 4. Garantia adicional no `/cursos/$videoId`
Manter a checagem server-side-equivalente (já existe) que redireciona para `/cursos?paywall=1` caso alguém cole a URL diretamente. Trocar `window.location.href` por `navigate({ to: "/cursos", search: { paywall: "1" } })` para evitar full reload e perder estado React.

## Arquivos afetados
- `src/routes/cursos.index.tsx` — trocar Links por buttons nos cards, carregar `user_roles`, corrigir helper `isSubscriptionActive`.
- `src/routes/cursos.$videoId.tsx` — carregar `user_roles`, trocar `window.location.href` por `navigate`.

## O que NÃO muda
Layout, design, hero, animação do popup, fluxo de pagamento simulado, popup de sucesso, comentários, área admin, agendamentos, autenticação, RLS, seed.

## Pergunta de validação
Você está testando com qual conta?
- `admin@afadadasunhas.com.br` → não deve ver popup (já é admin/ativo) ✅
- `admin22@afadadasunhas.com.br` ou outra conta nova → deve ver popup; é onde o bug aparece.

Se for o primeiro caso, posso te criar uma conta de teste sem assinatura para você validar visualmente o popup.
