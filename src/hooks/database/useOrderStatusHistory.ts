
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { OrderStatusHistory } from '@/types/database';

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
