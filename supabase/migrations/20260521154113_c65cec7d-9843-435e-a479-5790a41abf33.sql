
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  duration_min integer NOT NULL DEFAULT 60,
  price numeric(10,2) NOT NULL DEFAULT 0,
  "order" integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are viewable by everyone"
  ON public.services FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage services"
  ON public.services FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.services (name, description, duration_min, price, "order") VALUES
  ('Manicure Clássica', 'Cutilagem, lixamento e esmaltação tradicional.', 50, 70, 0),
  ('Manicure Russa', 'Técnica avançada de cutilagem sem corte da pele.', 90, 130, 1),
  ('Esmaltação em Gel', 'Durabilidade de até 4 semanas com brilho intenso.', 75, 110, 2),
  ('Alongamento em Fibra', 'Modelagem personalizada e acabamento premium.', 120, 220, 3),
  ('Spa das Mãos', 'Hidratação profunda, esfoliação e massagem.', 40, 90, 4),
  ('Nail Art Autoral', 'Desenhos exclusivos e técnicas decorativas.', 60, 80, 5);
