
DO $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Находим ID пользователя по email
  SELECT id INTO target_user_id FROM auth.users WHERE email = 'halafbashar@gmail.com';

  -- Если пользователь найден, назначаем ему роль суперадминистратора
  IF target_user_id IS NOT NULL THEN
    -- Проверяем, есть ли у пользователя уже роль администратора
    IF EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = target_user_id AND role = 'admin') THEN
      -- Если есть, обновляем ее, устанавливая флаг is_super_admin
      UPDATE public.user_roles
      SET is_super_admin = true
      WHERE user_id = target_user_id AND role = 'admin';
    ELSE
      -- Если нет, создаем новую запись с ролью администратора и флагом is_super_admin
      -- Также удаляем другие возможные роли, чтобы избежать дублирования
      DELETE FROM public.user_roles WHERE user_id = target_user_id;
      INSERT INTO public.user_roles (user_id, role, is_super_admin)
      VALUES (target_user_id, 'admin', true);
    END IF;
  END IF;
END $$;
