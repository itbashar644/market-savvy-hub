
-- Функция для автоматического создания номера заказа
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number = 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(NEXTVAL('order_number_seq')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Создание последовательности для номеров заказов
CREATE SEQUENCE order_number_seq START 1;

-- Триггер для генерации номера заказа
CREATE TRIGGER generate_order_number_trigger BEFORE INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Функция для обновления статистики клиента при изменении заказов
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER AS $$
DECLARE
    customer_total_orders INTEGER;
    customer_total_spent DECIMAL(10,2);
    customer_last_order_date DATE;
BEGIN
    -- Вычисляем статистику для клиента
    SELECT 
        COUNT(*),
        COALESCE(SUM(total), 0),
        MAX(created_at::DATE)
    INTO 
        customer_total_orders,
        customer_total_spent,
        customer_last_order_date
    FROM orders 
    WHERE customer_id = COALESCE(NEW.customer_id, OLD.customer_id)
    AND status != 'cancelled';
    
    -- Обновляем статистику клиента
    UPDATE customers 
    SET 
        total_orders = customer_total_orders,
        total_spent = customer_total_spent,
        last_order_date = customer_last_order_date
    WHERE id = COALESCE(NEW.customer_id, OLD.customer_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Триггеры для обновления статистики клиентов
CREATE TRIGGER update_customer_stats_on_insert AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

CREATE TRIGGER update_customer_stats_on_update AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

CREATE TRIGGER update_customer_stats_on_delete AFTER DELETE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- Функция для автоматического добавления записи в историю статусов заказа
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- При создании заказа добавляем первую запись в историю
    IF TG_OP = 'INSERT' THEN
        INSERT INTO order_status_history (order_id, to_status, notes)
        VALUES (NEW.id, NEW.status, 'Заказ создан');
        RETURN NEW;
    END IF;
    
    -- При обновлении статуса добавляем запись об изменении
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO order_status_history (order_id, from_status, to_status, notes)
        VALUES (NEW.id, OLD.status, NEW.status, 
                'Статус изменен с "' || OLD.status || '" на "' || NEW.status || '"');
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для логирования изменений статуса заказа
CREATE TRIGGER log_order_status_change_on_insert AFTER INSERT ON orders
    FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

CREATE TRIGGER log_order_status_change_on_update AFTER UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION log_order_status_change();
