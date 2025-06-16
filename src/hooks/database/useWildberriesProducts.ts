import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useSyncLogs } from './useSyncLogs';

export interface WildberriesProduct {
  id: string;
  user_id: string;
  nm_id: number;
  sku: string;
  title: string;
  brand?: string;
  category?: string;
  price?: number;
  discount_price?: number;
  rating: number;
  feedbacks_count: number;
  stock_quantity: number;
  warehouse_id?: number;
  barcode?: string;
  article?: string;
  size?: string;
  color?: string;
  photos?: any[];
  videos?: any[];
  description?: string;
  characteristics?: any[];
  tags?: any[];
  status: string;
  created_at: string;
  updated_at: string;
  synced_at: string;
}

export const useWildberriesProducts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const { 
    addWildberriesConnectionTest, 
    addWildberriesSync, 
    addWildberriesStockUpdate 
  } = useSyncLogs();

  // Получение списка товаров из базы данных
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['wildberries-products'],
    queryFn: async () => {
      console.log('Fetching WB products from database...');
      
      const { data, error } = await supabase
        .from('wildberries_products')
        .select('*')
        .order('synced_at', { ascending: false });

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      console.log('Fetched products count:', data?.length || 0);
      return data as WildberriesProduct[];
    }
  });

  // Тестирование подключения к WB
  const testConnectionMutation = useMutation({
    mutationFn: async ({ apiKey, warehouseId }: { apiKey: string; warehouseId: string }) => {
      const startTime = Date.now();
      console.log('Testing WB connection...');
      
      const { data, error } = await supabase.functions.invoke('wb-connection-test', {
        body: { apiKey, warehouseId }
      });

      if (error) {
        const duration = Date.now() - startTime;
        console.error('Connection test function error:', error);
        addWildberriesConnectionTest(false, error.message, warehouseId);
        throw new Error(`Ошибка функции: ${error.message}`);
      }
      
      if (data?.error) {
        const duration = Date.now() - startTime;
        console.error('Connection test API error:', data.error);
        addWildberriesConnectionTest(false, data.error, warehouseId);
        throw new Error(data.error);
      }

      const duration = Date.now() - startTime;
      addWildberriesConnectionTest(true, undefined, warehouseId);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Подключение успешно",
        description: `Найдено товаров на складе: ${data?.stocksCount || 0}`,
      });
    },
    onError: (error: any) => {
      console.error('Connection test error:', error);
      toast({
        title: "Ошибка подключения",
        description: error.message || "Не удалось подключиться к Wildberries",
        variant: "destructive",
      });
    }
  });

  // Синхронизация товаров с Wildberries
  const syncProductsMutation = useMutation({
    mutationFn: async ({ apiKey, warehouseId }: { apiKey: string; warehouseId: string }) => {
      setLoading(true);
      const startTime = Date.now();
      console.log('Starting WB products sync...');
      
      // Получаем текущего пользователя
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        const duration = Date.now() - startTime;
        addWildberriesSync(false, undefined, 'Пользователь не авторизован', duration);
        throw new Error('Пользователь не авторизован');
      }
      
      console.log('Calling wb-fetch-products function...');
      
      // Вызываем функцию для получения товаров
      const { data, error } = await supabase.functions.invoke('wb-fetch-products', {
        body: { apiKey, warehouseId }
      });

      console.log('Function response:', { data, error });

      if (error) {
        const duration = Date.now() - startTime;
        console.error('Function error:', error);
        addWildberriesSync(false, undefined, `Ошибка функции: ${error.message}`, duration);
        throw new Error(`Ошибка функции: ${error.message}`);
      }
      
      if (data?.error) {
        const duration = Date.now() - startTime;
        console.error('API error:', data.error);
        addWildberriesSync(false, undefined, data.error, duration);
        throw new Error(data.error);
      }

      const duration = Date.now() - startTime;
      let metadata = {
        originalCount: data?.total || 0,
        validCount: data?.products?.length || 0,
        updatedCount: 0
      };

      // Сохраняем товары в базу данных
      if (data?.products && data.products.length > 0) {
        console.log('Saving products to database:', data.products.length);
        
        const { error: insertError } = await supabase
          .from('wildberries_products')
          .upsert(
            data.products.map((product: any) => ({
              ...product,
              user_id: userData.user.id,
              synced_at: new Date().toISOString()
            })),
            { 
              onConflict: 'nm_id,sku',
              ignoreDuplicates: false 
            }
          );

        if (insertError) {
          console.error('Insert error:', insertError);
          addWildberriesSync(false, metadata, `Ошибка сохранения в БД: ${insertError.message}`, duration);
          throw insertError;
        }
        
        metadata.updatedCount = data.products.length;
        console.log('Products saved successfully');
      }

      addWildberriesSync(true, metadata, undefined, duration);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wildberries-products'] });
      toast({
        title: "Товары синхронизированы",
        description: `Загружено ${data?.products?.length || 0} товаров из Wildberries`,
      });
      setLoading(false);
    },
    onError: (error: any) => {
      console.error('Sync error:', error);
      toast({
        title: "Ошибка синхронизации",
        description: error.message || "Не удалось синхронизировать товары",
        variant: "destructive",
      });
      setLoading(false);
    }
  });

  // Обновление остатков
  const updateStocksMutation = useMutation({
    mutationFn: async ({ apiKey, warehouseId, stocks }: { 
      apiKey: string; 
      warehouseId: string;
      stocks: Array<{ sku: string; amount: number }>;
    }) => {
      const startTime = Date.now();
      console.log('Updating WB stocks...');
      
      const { data, error } = await supabase.functions.invoke('wb-update-stocks', {
        body: { apiKey, warehouseId, stocks }
      });

      const duration = Date.now() - startTime;

      if (error) {
        console.error('Update stocks function error:', error);
        addWildberriesStockUpdate(false, undefined, `Ошибка функции: ${error.message}`, duration);
        throw new Error(`Ошибка функции: ${error.message}`);
      }
      
      if (data?.error) {
        console.error('Update stocks API error:', data.error);
        addWildberriesStockUpdate(false, undefined, data.error, duration);
        throw new Error(data.error);
      }

      const metadata = {
        originalCount: data?.originalCount || stocks.length,
        validCount: data?.validCount || stocks.length,
        updatedCount: data?.updatedCount || 0
      };

      addWildberriesStockUpdate(true, metadata, undefined, duration);
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Остатки обновлены",
        description: `Обновлено позиций: ${data?.updatedCount || 0}`,
      });
    },
    onError: (error: any) => {
      console.error('Update stocks error:', error);
      toast({
        title: "Ошибка обновления остатков",
        description: error.message || "Не удалось обновить остатки",
        variant: "destructive",
      });
    }
  });

  // Удаление товара
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      console.log('Deleting product:', productId);
      
      const { error } = await supabase
        .from('wildberries_products')
        .delete()
        .eq('id', productId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wildberries-products'] });
      toast({
        title: "Товар удален",
        description: "Товар успешно удален из списка",
      });
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const testConnection = useCallback((apiKey: string, warehouseId: string) => {
    console.log('Testing connection with API key and warehouse ID:', !!apiKey, warehouseId);
    testConnectionMutation.mutate({ apiKey, warehouseId });
  }, [testConnectionMutation]);

  const syncProducts = useCallback((apiKey: string, warehouseId: string) => {
    console.log('Starting sync with API key and warehouse ID:', !!apiKey, warehouseId);
    syncProductsMutation.mutate({ apiKey, warehouseId });
  }, [syncProductsMutation]);

  const updateStocks = useCallback((apiKey: string, warehouseId: string, stocks: Array<{ sku: string; amount: number }>) => {
    updateStocksMutation.mutate({ apiKey, warehouseId, stocks });
  }, [updateStocksMutation]);

  const deleteProduct = useCallback((productId: string) => {
    deleteProductMutation.mutate(productId);
  }, [deleteProductMutation]);

  return {
    products,
    isLoading: isLoading || loading,
    error,
    testConnection,
    syncProducts,
    updateStocks,
    deleteProduct,
    isTestingConnection: testConnectionMutation.isPending,
    isSyncing: syncProductsMutation.isPending || loading,
    isUpdatingStocks: updateStocksMutation.isPending
  };
};
