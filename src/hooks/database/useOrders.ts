
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { Order } from '@/types/database';

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
