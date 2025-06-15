
-- Добавляем колонку source в таблицу orders для отслеживания источника заказа
ALTER TABLE public.orders
ADD COLUMN source TEXT NOT NULL DEFAULT 'CRM';

-- Добавляем комментарий к новой колонке для ясности
COMMENT ON COLUMN public.orders.source IS 'Источник заказа (например, ''CRM'', ''Сайт-1'', ''Маркетплейс-2'')';
