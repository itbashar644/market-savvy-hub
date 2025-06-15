
-- 1. Создаем новый тип данных (ENUM) для статусов пользователей
CREATE TYPE public.user_status AS ENUM ('pending', 'approved');

-- 2. Добавляем колонку 'status' в существующую таблицу 'profiles'
ALTER TABLE public.profiles ADD COLUMN status public.user_status NOT NULL DEFAULT 'pending';

-- 3. Устанавливаем статус 'approved' для всех существующих пользователей, чтобы они не потеряли доступ
UPDATE public.profiles SET status = 'approved';

-- 4. Обновляем функцию-триггер для создания профиля с начальным статусом 'pending'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Добавляем новую запись в `profiles`
  INSERT INTO public.profiles (id, name, email, status)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    'pending'
  );
  
  -- Добавляем роль пользователя по умолчанию
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  return new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Удаляем старый триггер, если он существует, и создаем новый
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Включаем защиту на уровне строк (RLS) для таблицы `profiles`
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Создаем политики RLS для управления доступом
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
