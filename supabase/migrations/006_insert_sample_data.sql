
-- Вставка тестовых данных

-- Тестовые клиенты
INSERT INTO customers (name, email, phone, address, city, country) VALUES
('Иван Петров', 'ivan.petrov@example.com', '+7 900 123-45-67', 'ул. Ленина, 10', 'Москва', 'Россия'),
('Мария Сидорова', 'maria.sidorova@example.com', '+7 900 987-65-43', 'пр. Мира, 25', 'Санкт-Петербург', 'Россия'),
('Алексей Козлов', 'alexey.kozlov@example.com', '+7 900 555-55-55', 'ул. Пушкина, 15', 'Екатеринбург', 'Россия');

-- Тестовые товары
INSERT INTO products (name, sku, category, price, description, image, stock, min_stock, max_stock, supplier, ozon_synced, wb_synced) VALUES
('Смартфон iPhone 15', 'IP15-128GB-BLK', 'Электроника', 89990.00, 'Новейший смартфон Apple iPhone 15 с камерой 48 МП', '/placeholder.svg', 50, 10, 100, 'Apple Official', true, false),
('Ноутбук MacBook Air M2', 'MBA-M2-256GB', 'Компьютеры', 119990.00, 'Ноутбук Apple MacBook Air на чипе M2', '/placeholder.svg', 25, 5, 50, 'Apple Official', false, true),
('Беспроводные наушники AirPods Pro', 'APP-2ND-GEN', 'Аксессуары', 24990.00, 'Беспроводные наушники с активным шумоподавлением', '/placeholder.svg', 3, 5, 30, 'Apple Official', true, true),
('Планшет iPad Air', 'IPA-2022-64GB', 'Планшеты', 64990.00, 'Планшет Apple iPad Air с чипом M1', '/placeholder.svg', 15, 8, 40, 'Apple Official', true, false),
('Умные часы Apple Watch Series 9', 'AW9-45MM-GPS', 'Аксессуары', 39990.00, 'Умные часы Apple Watch Series 9', '/placeholder.svg', 20, 10, 50, 'Apple Official', false, true);

-- Создание записей в таблице остатков на основе товаров
INSERT INTO inventory (product_id, name, sku, category, current_stock, min_stock, max_stock, price, supplier)
SELECT id, name, sku, category, stock, min_stock, max_stock, price, supplier
FROM products;

-- Тестовые записи истории изменений остатков
INSERT INTO inventory_history (product_id, product_name, sku, previous_stock, new_stock, change_amount, change_type, reason, user_name)
SELECT 
    p.id,
    p.name,
    p.sku,
    60,
    p.stock,
    p.stock - 60,
    'sale',
    'Продажа через интернет-магазин',
    'Система'
FROM products p
WHERE p.sku = 'IP15-128GB-BLK';

INSERT INTO inventory_history (product_id, product_name, sku, previous_stock, new_stock, change_amount, change_type, reason, user_name)
SELECT 
    p.id,
    p.name,
    p.sku,
    20,
    p.stock,
    p.stock - 20,
    'restock',
    'Поступление от поставщика',
    'Администратор'
FROM products p
WHERE p.sku = 'MBA-M2-256GB';
