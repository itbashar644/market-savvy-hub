
-- Создание таблицы остатков
CREATE TABLE inventory (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  current_stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 0,
  max_stock INTEGER DEFAULT 100,
  price DECIMAL(10,2) NOT NULL,
  supplier VARCHAR(255),
  last_restocked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'low_stock', 'out_of_stock'))
);

-- Создание таблицы истории изменений остатков
CREATE TABLE inventory_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(100) NOT NULL,
  previous_stock INTEGER NOT NULL,
  new_stock INTEGER NOT NULL,
  change_amount INTEGER NOT NULL,
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('manual', 'sale', 'restock', 'adjustment', 'return')),
  reason TEXT,
  user_id VARCHAR(255),
  user_name VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Создание индексов
CREATE INDEX idx_inventory_product_id ON inventory(product_id);
CREATE INDEX idx_inventory_status ON inventory(status);
CREATE INDEX idx_inventory_current_stock ON inventory(current_stock);
CREATE INDEX idx_inventory_history_product_id ON inventory_history(product_id);
CREATE INDEX idx_inventory_history_timestamp ON inventory_history(timestamp);

-- Функция для автоматического обновления статуса остатков
CREATE OR REPLACE FUNCTION update_inventory_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Обновляем статус на основе текущего остатка
    IF NEW.current_stock <= 0 THEN
        NEW.status = 'out_of_stock';
    ELSIF NEW.current_stock <= NEW.min_stock THEN
        NEW.status = 'low_stock';
    ELSE
        NEW.status = 'in_stock';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание триггера для автоматического обновления статуса
CREATE TRIGGER update_inventory_status_trigger BEFORE INSERT OR UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_inventory_status();
