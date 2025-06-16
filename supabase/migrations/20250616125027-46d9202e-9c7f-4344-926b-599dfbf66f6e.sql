
-- Включение Row Level Security для таблиц inventory и inventory_history
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_history ENABLE ROW LEVEL SECURITY;

-- Создание политик доступа для inventory (разрешаем все операции для аутентифицированных пользователей)
CREATE POLICY "Enable all operations for authenticated users" ON inventory
    FOR ALL USING (auth.role() = 'authenticated');

-- Создание политик доступа для inventory_history (разрешаем все операции для аутентифицированных пользователей)
CREATE POLICY "Enable all operations for authenticated users" ON inventory_history
    FOR ALL USING (auth.role() = 'authenticated');
