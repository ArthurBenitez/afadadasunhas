
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('course-videos', 'course-videos', true, 524288000, ARRAY['video/mp4','video/webm','video/quicktime','video/x-matroska','video/ogg']),
  ('course-thumbnails', 'course-thumbnails', true, 10485760, ARRAY['image/jpeg','image/png','image/webp','image/gif','image/avif'])
ON CONFLICT (id) DO UPDATE
  SET public = EXCLUDED.public,
      file_size_limit = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Course media public read"
ON storage.objects FOR SELECT
USING (bucket_id IN ('course-videos','course-thumbnails'));

CREATE POLICY "Admins can upload course media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id IN ('course-videos','course-thumbnails') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update course media"
ON storage.objects FOR UPDATE
USING (bucket_id IN ('course-videos','course-thumbnails') AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete course media"
ON storage.objects FOR DELETE
USING (bucket_id IN ('course-videos','course-thumbnails') AND public.has_role(auth.uid(), 'admin'));
