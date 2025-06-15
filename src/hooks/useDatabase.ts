
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { Customer, Product, Order, InventoryItem, SalesData, CategoryData } from '@/types/database';

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

  return {
    orders,
    loading,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
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

  const updateStock = (productId: string, newStock: number) => {
    const updated = db.updateInventoryStock(productId, newStock);
    refreshInventory();
    return updated;
  };

  return {
    inventory,
    loading,
    updateStock,
    refreshInventory,
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

export const useDatabase = () => {
  const initializeDatabase = () => {
    db.seedDatabase();
  };

  return {
    initializeDatabase,
  };
};
