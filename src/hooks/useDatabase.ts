import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/database';
import { Customer, Product, Order, InventoryItem, InventoryHistory, SalesData, CategoryData, OrderStatusHistory } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCustomers = () => {
    setCustomers(db.getCustomers());
    setLoading(false);
  };

  useEffect(() => {
    refreshCustomers();
  }, []);

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = db.addCustomer(customer);
    refreshCustomers();
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const updated = db.updateCustomer(id, updates);
    refreshCustomers();
    return updated;
  };

  const deleteCustomer = (id: string) => {
    const success = db.deleteCustomer(id);
    refreshCustomers();
    return success;
  };

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers,
  };
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProducts = () => {
    setProducts(db.getProducts());
    setLoading(false);
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct = db.addProduct(product);
    refreshProducts();
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = db.updateProduct(id, updates);
    refreshProducts();
    return updated;
  };

  const deleteProduct = (id: string) => {
    const success = db.deleteProduct(id);
    refreshProducts();
    return success;
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  };
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = () => {
    setOrders(db.getOrders());
    setLoading(false);
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newOrder = db.addOrder(order);
    refreshOrders();
    return newOrder;
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    const updated = db.updateOrder(id, updates);
    refreshOrders();
    return updated;
  };

  const deleteOrder = (id: string) => {
    const success = db.deleteOrder(id);
    refreshOrders();
    return success;
  };

  const getOrderWithHistory = (orderId: string) => {
    return db.getOrderWithHistory(orderId);
  };

  return {
    orders,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
    getOrderWithHistory,
  };
};

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshInventory = () => {
    setInventory(db.getInventory());
    setLoading(false);
  };

  useEffect(() => {
    refreshInventory();
  }, []);

  const updateStock = (productId: string, newStock: number, changeType: InventoryHistory['changeType'] = 'manual', reason?: string) => {
    const updated = db.updateInventoryStock(productId, newStock, changeType, reason);
    refreshInventory();
    return updated;
  };

  const bulkUpdateStock = (updates: { sku: string; newStock: number }[]) => {
    db.bulkUpdateInventoryStock(updates);
    refreshInventory();
  };

  return {
    inventory,
    loading,
    updateStock,
    bulkUpdateStock,
    refreshInventory,
  };
};

export const useInventoryHistory = () => {
  const [history, setHistory] = useState<InventoryHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshHistory = () => {
    setHistory(db.getInventoryHistory());
    setLoading(false);
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  return {
    history,
    loading,
    refreshHistory,
  };
};

export const useOrderStatusHistory = () => {
  const [history, setHistory] = useState<OrderStatusHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshHistory = () => {
    setHistory(db.getOrderStatusHistory());
    setLoading(false);
  };

  useEffect(() => {
    refreshHistory();
  }, []);

  return {
    history,
    loading,
    refreshHistory,
  };
};

export const useAnalytics = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAnalytics = (period: 'week' | 'month' | 'year' = 'month') => {
    setSalesData(db.getSalesData(period));
    setCategoryData(db.getCategoryData());
    setLoading(false);
  };

  useEffect(() => {
    refreshAnalytics();
  }, []);

  return {
    salesData,
    categoryData,
    loading,
    refreshAnalytics,
  };
};

export interface MarketplaceCredential {
  id?: number;
  user_id?: string;
  marketplace: string;
  api_key?: string | null;
  client_id?: string | null;
  warehouse_id?: string | null;
}

export const useMarketplaceCredentials = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Record<string, Partial<MarketplaceCredential>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchCredentials = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_credentials')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const credsMap = data.reduce((acc, cred) => {
        acc[cred.marketplace] = cred;
        return acc;
      }, {} as Record<string, MarketplaceCredential>);

      setCredentials(credsMap);
    } catch (error: any) {
      toast({
        title: 'Ошибка загрузки ключей API',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      fetchCredentials();
    } else {
      setCredentials({});
      setLoading(false);
    }
  }, [user, fetchCredentials]);

  const updateCredentialField = (marketplace: string, field: keyof Omit<MarketplaceCredential, 'id' | 'user_id' | 'created_at' | 'updated_at'>, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [marketplace]: {
        ...prev[marketplace],
        marketplace,
        [field]: value,
      },
    }));
  };

  const saveCredentials = async (marketplace: string) => {
    if (!user) {
      toast({ title: 'Ошибка', description: 'Пользователь не авторизован.', variant: 'destructive' });
      return;
    }

    const credToSave = credentials[marketplace];
    if (!credToSave) {
      toast({ title: 'Ошибка', description: 'Нет данных для сохранения.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_credentials')
        .upsert({
          user_id: user.id,
          marketplace: credToSave.marketplace,
          api_key: credToSave.api_key,
          client_id: credToSave.client_id,
          warehouse_id: credToSave.warehouse_id,
        }, { onConflict: 'user_id, marketplace' })
        .select()
        .single();
      
      if (error) throw error;

      setCredentials(prev => ({ ...prev, [marketplace]: data }));
      toast({
        title: 'Успешно!',
        description: `Настройки для ${marketplace} сохранены.`,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка сохранения настроек',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return {
    credentials,
    loading,
    saving,
    updateCredentialField,
    saveCredentials,
  };
};

export const useDatabase = () => {
  const initializeDatabase = () => {
    db.seedDatabase();
  };

  return {
    initializeDatabase,
  };
};
