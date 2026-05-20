UPDATE auth.users
SET encrypted_password = crypt('#@tralalerotralala33sahurz&', gen_salt('bf')),
    updated_at = now()
WHERE email = 'admin@afadadasunhas.com.br';