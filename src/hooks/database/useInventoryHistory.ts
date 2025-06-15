
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { InventoryHistory } from '@/types/database';

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
