-- Add expert role to lorena.pantano@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('cf688dea-9cc9-42d6-b4a7-f1d1ac40ab59', 'expert')
ON CONFLICT (user_id, role) DO NOTHING;