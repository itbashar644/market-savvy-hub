
-- Добавляем поле wildberries_sku к таблице products
ALTER TABLE products ADD COLUMN wildberries_sku VARCHAR(50);

-- Создаем индекс для быстрого поиска по SKU Wildberries
CREATE INDEX idx_products_wildberries_sku ON products(wildberries_sku);
