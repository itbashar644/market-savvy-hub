
import { useState } from 'react';
import { useWildberriesSync } from './useWildberriesSync';
import { useWildberriesStockUpdate } from './useWildberriesStockUpdate';

export const useWildberriesProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { syncProducts } = useWildberriesSync();
  const { updateStock } = useWildberriesStockUpdate();

  const handleSync = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await syncProducts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (products: any[]) => {
    setLoading(true);
    setError(null);
    
    try {
      await updateStock(products);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    syncProducts: handleSync,
    updateStock: handleStockUpdate,
  };
};
