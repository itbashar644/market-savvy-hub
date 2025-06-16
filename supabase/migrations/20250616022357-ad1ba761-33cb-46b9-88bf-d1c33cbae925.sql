
-- Создаем таблицу для товаров Wildberries
CREATE TABLE public.wildberries_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  nm_id BIGINT UNIQUE NOT NULL, -- ID товара в WB
  sku VARCHAR NOT NULL, -- SKU товара
  title TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price NUMERIC,
  discount_price NUMERIC,
  rating NUMERIC DEFAULT 0,
  feedbacks_count INTEGER DEFAULT 0,
  stock_quantity INTEGER DEFAULT 0,
  warehouse_id INTEGER,
  barcode TEXT,
  article TEXT, -- Артикул продавца
  size TEXT,
  color TEXT,
  photos JSONB, -- Массив ссылок на фото
  videos JSONB, -- Массив ссылок на видео
  description TEXT,
  characteristics JSONB, -- Характеристики товара
  tags JSONB, -- Теги товара
  status TEXT DEFAULT 'active', -- active, moderation, blocked, etc
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Добавляем RLS для безопасности
ALTER TABLE public.wildberries_products ENABLE ROW LEVEL SECURITY;

-- Политики доступа - пользователи видят только свои товары
CREATE POLICY "Users can view their own WB products" 
  ON public.wildberries_products 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own WB products" 
  ON public.wildberries_products 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own WB products" 
  ON public.wildberries_products 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own WB products" 
  ON public.wildberries_products 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Добавляем триггер для обновления updated_at
CREATE TRIGGER update_wildberries_products_updated_at
  BEFORE UPDATE ON public.wildberries_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Создаем индексы для быстрого поиска
CREATE INDEX idx_wildberries_products_user_id ON public.wildberries_products(user_id);
CREATE INDEX idx_wildberries_products_nm_id ON public.wildberries_products(nm_id);
CREATE INDEX idx_wildberries_products_sku ON public.wildberries_products(sku);
CREATE INDEX idx_wildberries_products_synced_at ON public.wildberries_products(synced_at);
