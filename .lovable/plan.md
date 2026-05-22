## Mudança

No modal "Fazer upload" (vídeo) em `/cursos`, substituir os campos de **URL do vídeo** e **URL da thumbnail** por dois inputs do tipo arquivo, que enviam diretamente para o Storage.

## Backend

Criar duas storage buckets via migration:
- `course-videos` (público, aceita `video/*`, limite ~500MB)
- `course-thumbnails` (público, aceita `image/*`, limite ~10MB)

Políticas RLS em `storage.objects`:
- SELECT público em ambas (para o `<video>` e `<img>` carregarem).
- INSERT/UPDATE/DELETE restritos a admins (`has_role(auth.uid(), 'admin')`).

As colunas `videos.video_url` e `videos.thumbnail_url` continuam armazenando uma string — agora a URL pública retornada pelo Storage. Sem mudança de schema.

## Frontend — `src/routes/cursos.index.tsx`

No `videoModal`:
- Trocar os `TextInput` de URL por dois `<input type="file">` (vídeo: `accept="video/*"`; thumbnail: `accept="image/*"`).
- Estado novo: `vidFile`, `vidThumbFile`, `uploading` (boolean) e barra/percentual simples (`vidProgress`, `thumbProgress`) opcional via `onUploadProgress` quando suportado.
- Ao salvar:
  1. Se `editing` e nenhum arquivo novo foi escolhido, mantém URLs existentes.
  2. Para cada arquivo novo: `supabase.storage.from('course-videos' | 'course-thumbnails').upload(path, file)` com `path = ${user.id}/${crypto.randomUUID()}-${file.name}`.
  3. Pegar URL pública via `getPublicUrl` e gravar em `videos.video_url` / `videos.thumbnail_url` no insert/update existente.
- Em criação, o vídeo é obrigatório; thumbnail é opcional.
- Desabilitar o botão "Salvar" enquanto `uploading`, mostrar `Loader2`.
- Em edição, exibir um pequeno preview do vídeo/thumb atual com link "Substituir arquivo".

## Não muda

- Schema das tabelas `videos`/`sections`/`services`.
- Player em `/cursos/$videoId` (continua lendo `video_url`).
- Fluxo de paywall, pagamento, modais de seção e de serviços.
- Layout, design tokens, realtime, RLS das tabelas existentes.
- Painel `/admin` (continua com URLs lá; se quiser, posso migrar depois — fora do escopo deste pedido).

## Arquivos afetados

- `supabase/migrations/<novo>.sql` — buckets + policies.
- `src/routes/cursos.index.tsx` — modal de vídeo (inputs de arquivo + upload).
