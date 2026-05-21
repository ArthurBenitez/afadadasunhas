
## Resumo

1. **Pagamento simulado** — A mensagem de sucesso (`showSuccessModal` com animação `CheckCircle2`) já existe e funciona em `src/routes/cursos.index.tsx`. Vou apenas confirmar que está disparando corretamente após o clique em "Ir para o pagamento" — sem alterações estruturais.

2. **Controles de admin inline em `/cursos`** — Hoje o admin precisa ir até `/admin` para criar seções/vídeos. Vou trazer esses controles para dentro da própria página `/cursos` quando o usuário for admin (sem remover o painel `/admin`).

3. **Gestão de serviços** (Manicure Russa, Alongamento em Fibra, etc.) — Hoje os serviços são uma lista hardcoded em `src/lib/booking/data.ts`. Vou migrar para uma tabela no banco e adicionar um CRUD para o admin.

---

## Mudanças

### A. Banco de dados (migration)

Criar tabela `services`:
- `id uuid pk`
- `name text not null`
- `description text`
- `duration_min int not null`
- `price numeric(10,2) not null`
- `order int default 0`
- `created_at`, `updated_at`

RLS:
- SELECT: público (qualquer um vê — usado em `/agendamentos`).
- INSERT/UPDATE/DELETE: apenas admin (`has_role(auth.uid(), 'admin')`).

Seed inicial: copiar os 6 serviços de `src/lib/booking/data.ts` para a tabela.

### B. `src/routes/cursos.index.tsx` (admin inline)

Quando `isAdmin === true`:
- **Header / navbar**: adicionar botões "Adicionar seção" e "Gerenciar serviços".
- **Cada seção (carousel)**: ao lado do título da seção, botões "Editar", "Excluir" e "Fazer upload" (adicionar vídeo).
- **Cada card de vídeo**: ícones de "Editar" e "Excluir" que aparecem em hover (não bloqueiam o clique normal de assistir).

Modais (Mantine `Modal`, mesmo padrão do `/admin`):
- **Modal de seção**: título, descrição, ordem (criar/editar).
- **Modal de vídeo**: título, descrição, URL do vídeo, URL da thumbnail, ordem (criar/editar).
- **Modal de serviços** ("Gerenciar serviços"): lista os serviços do banco com botões de editar/excluir + formulário para novo serviço (nome, descrição, duração em minutos, preço em BRL, ordem).

Confirmação (`window.confirm`) antes de excluir seção/vídeo/serviço.
Realtime já está ativo para `sections` e `videos`; adicionar canal para `services` também.

Usuário comum continua vendo a página exatamente como hoje — nenhum botão de admin aparece.

### C. `src/routes/agendamentos.tsx` + `src/lib/booking/data.ts`

- Manter `availableSlots`, `brl` e `PREPAY_DISCOUNT` em `data.ts`.
- Remover o array `services` hardcoded.
- Em `agendamentos.tsx`, carregar `services` do Supabase em um `useEffect` (a tabela é leitura pública, sem necessidade de login).
- Manter o tipo `Service` (com `durationMin` no front, mapeando `duration_min` do banco).

### D. Painel `/admin`

Sem mudanças — continua funcionando como atalho secundário. Os mesmos botões agora vivem também dentro de `/cursos`.

---

## O que NÃO muda

- Fluxo de pagamento simulado, modais de paywall e sucesso, animações.
- Layout, design tokens, hero, carrosséis, cores.
- Autenticação, RLS de tabelas existentes, seed de vídeos.
- Página `/admin` permanece acessível.
- Comentários (já listados em `/admin` → aba Comentários).
