
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { InventoryHistory } from '@/types/database';

export const useInventoryHistory = () => {
  const [history, setHistory] = useState<InventoryHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_history')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching inventory history:', error);
        return;
      }

      // Transform Supabase data to match our InventoryHistory type
      const transformedData: InventoryHistory[] = data.map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        sku: item.sku,
        previousStock: item.previous_stock,
        newStock: item.new_stock,
        changeAmount: item.change_amount,
        changeType: item.change_type as InventoryHistory['changeType'],
        reason: item.reason,
        userId: item.user_id,
        userName: item.user_name,
        timestamp: item.timestamp,
      }));

      setHistory(transformedData);
    } catch (error) {
      console.error('Error in refreshHistory:', error);
    } finally {
      setLoading(false);
    }
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
