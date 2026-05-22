-- Explicit UPDATE policy on comments: owner-only, and author_name is immutable
CREATE POLICY "Users can update their own comments"
ON public.comments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND author_name IS NOT DISTINCT FROM (
    SELECT c.author_name FROM public.comments c WHERE c.id = comments.id
  )
);