
-- Включение Row Level Security для всех таблиц
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;

-- Создание политик доступа (пока разрешаем все операции для аутентифицированных пользователей)
-- В будущем можно настроить более детальные права доступа

-- Политики для customers
CREATE POLICY "Enable all operations for authenticated users" ON customers
    FOR ALL USING (auth.role() = 'authenticated');

-- Политики для products
CREATE POLICY "Enable all operations for authenticated users" ON products
    FOR ALL USING (auth.role() = 'authenticated');

-- Политики для orders
CREATE POLICY "Enable all operations for authenticated users" ON orders
    FOR ALL USING (auth.role() = 'authenticated');

-- Политики для order_items
CREATE POLICY "Enable all operations for authenticated users" ON order_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Политики для order_status_history
CREATE POLICY "Enable all operations for authenticated users" ON order_status_history
    FOR ALL USING (auth.role() = 'authenticated');

-- Политики для inventory
CREATE POLICY "Enable all operations for authenticated users" ON inventory
    FOR ALL USING (auth.role() = 'authenticated');

-- Политики для inventory_history
CREATE POLICY "Enable all operations for authenticated users" ON inventory_history
    FOR ALL USING (auth.role() = 'authenticated');
