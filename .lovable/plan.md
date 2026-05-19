## Diagnóstico

Identifiquei três problemas conectados que estão bloqueando o acesso admin:

1. **Recursão infinita nas políticas RLS da tabela `profiles`** (erro `42P17` em todas as requisições). A política "Admins can view all profiles" consulta a própria tabela `profiles`, o que cria loop infinito. Resultado: nenhuma query funciona após o login — nem `profiles`, nem `sections`, nem `subscriptions`. Por isso a UI de admin nunca aparece (o frontend não consegue ler `profile.role`).
2. **Conta admin sem papel atribuído**. O `admin@afadadasunhas.com.br` foi criado, mas o trigger insere todos como `role = 'user'`. Precisa ser promovido a `admin` e ter assinatura ativa.
3. **Banco vazio** — nenhuma seção/vídeo de exemplo, então mesmo após o fix a página fica "crua".

## Plano de correção

### 1. Refatorar segurança (migration)
- Criar enum `app_role` e tabela dedicada `user_roles` (padrão seguro recomendado, separa papéis dos perfis e elimina recursão).
- Criar função `SECURITY DEFINER` `public.has_role(_user_id, _role)` para checar papel sem disparar RLS.
- **Reescrever todas as políticas** que hoje fazem `SELECT … FROM profiles WHERE role='admin'` (em `profiles`, `sections`, `videos`, `comments`, `subscriptions`) para usar `public.has_role(auth.uid(), 'admin')`.
- Atualizar trigger `handle_new_user` para também inserir `('user_id', 'user')` em `user_roles`.
- Migrar papel existente: para cada linha em `profiles` com `role='admin'`, inserir em `user_roles`.

### 2. Promover conta admin + ativar assinatura (data insert)
- Inserir `(admin_user_id, 'admin')` em `user_roles`.
- Atualizar `profiles.role = 'admin'` para `admin@afadadasunhas.com.br` (mantido por compat).
- Marcar `subscriptions.is_active = true` para esse usuário.

### 3. Seed de conteúdo de exemplo (data insert)
Inserir 3 seções com 2–3 vídeos cada (Fundamentos, Técnica Russa, Nail Art), reaproveitando thumbnails Unsplash e vídeos públicos de demonstração que já existiam no mock `src/lib/courses/data.ts`.

### 4. Ajuste pontual no frontend
- Em `src/components/site-header.tsx` e `src/routes/admin.tsx`, trocar a checagem de role para usar `user_roles` via `has_role` RPC (ou consultar `user_roles` diretamente). Isso é o único toque na UI — nenhuma outra tela é alterada.
- Adicionar fallback: se `profile.role === 'admin'` OU existir linha em `user_roles`, libera o painel (para não quebrar nada se a migração de papel atrasar).

## Detalhes técnicos

```sql
-- enum + tabela
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- função sem recursão
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS(SELECT 1 FROM public.user_roles WHERE user_id=_user_id AND role=_role) $$;

-- substitui policies recursivas, ex.:
DROP POLICY "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
```

## O que NÃO será alterado
- Layout, design, paleta, hero, header (exceto a leitura do role).
- Rotas de agendamento, cursos, vídeo player, comentários.
- Lógica do popup de assinatura inativa.

## Confirmação necessária
Vou usar o e-mail `admin@afadadasunhas.com.br` já cadastrado como admin oficial. **Confirma essa conta?** (a outra criada com typo `…com.b` será ignorada).
