-- Function to elevate a user to admin by email
CREATE OR REPLACE FUNCTION public.elevate_to_admin(user_email TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id IN (
    SELECT id FROM auth.users WHERE email = user_email
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
