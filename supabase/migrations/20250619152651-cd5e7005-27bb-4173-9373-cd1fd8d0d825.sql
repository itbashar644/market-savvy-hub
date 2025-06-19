
-- Создаем таблицу для хранения SKU и остатков Wildberries
CREATE TABLE public.wildberries_stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  internal_sku TEXT NOT NULL, -- Внутренний SKU (article_number из products)
  wildberries_sku TEXT NOT NULL, -- SKU Wildberries (числовой)
  stock_quantity INTEGER NOT NULL DEFAULT 0, -- Текущий остаток
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(internal_sku),
  UNIQUE(wildberries_sku)
);

-- Добавляем RLS для безопасности
ALTER TABLE public.wildberries_stock ENABLE ROW LEVEL SECURITY;

-- Создаем политики RLS (пока разрешаем все операции аутентифицированным пользователям)
CREATE POLICY "Authenticated users can view wildberries_stock" 
  ON public.wildberries_stock 
  FOR SELECT 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert wildberries_stock" 
  ON public.wildberries_stock 
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update wildberries_stock" 
  ON public.wildberries_stock 
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete wildberries_stock" 
  ON public.wildberries_stock 
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- Создаем триггер для автоматического обновления updated_at
CREATE TRIGGER update_wildberries_stock_updated_at
  BEFORE UPDATE ON public.wildberries_stock
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Создаем индексы для оптимизации запросов
CREATE INDEX idx_wildberries_stock_internal_sku ON public.wildberries_stock(internal_sku);
CREATE INDEX idx_wildberries_stock_wildberries_sku ON public.wildberries_stock(wildberries_sku);
CREATE INDEX idx_wildberries_stock_product_id ON public.wildberries_stock(product_id);
