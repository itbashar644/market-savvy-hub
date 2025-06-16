
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

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

  // Получение списка товаров WB из базы данных
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['wildberries-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('wildberries_products')
        .select('*')
        .order('synced_at', { ascending: false });

      if (error) throw error;
      return data as WildberriesProduct[];
    }
  });

  // Синхронизация товаров с Wildberries API
  const syncProductsMutation = useMutation({
    mutationFn: async (apiKey: string) => {
      setLoading(true);
      
      // Получаем пользователя заранее
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        throw new Error('Пользователь не авторизован');
      }
      
      console.log('Calling wildberries-products-list function...');
      
      // Вызываем edge function для получения товаров
      const { data, error } = await supabase.functions.invoke('wildberries-products-list', {
        body: { apiKey }
      });

      console.log('Function response:', { data, error });

      if (error) {
        console.error('Function error:', error);
        throw new Error(`Ошибка при вызове функции: ${error.message}`);
      }
      
      if (data?.error) {
        console.error('API error:', data.error);
        throw new Error(data.error);
      }

      // Сохраняем товары в базу данных
      if (data?.products && data.products.length > 0) {
        console.log('Saving products to database:', data.products.length);
        
        const { error: insertError } = await supabase
          .from('wildberries_products')
          .upsert(
            data.products.map((product: any) => ({
              ...product,
              user_id: userData.user.id
            })),
            { 
              onConflict: 'nm_id',
              ignoreDuplicates: false 
            }
          );

        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        
        console.log('Products saved successfully');
      }

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
      console.error('Sync error details:', error);
      toast({
        title: "Ошибка синхронизации",
        description: error.message || "Не удалось синхронизировать товары",
        variant: "destructive",
      });
      setLoading(false);
    }
  });

  // Удаление товара
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
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
      toast({
        title: "Ошибка удаления",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const syncProducts = useCallback((apiKey: string) => {
    console.log('Starting sync with API key length:', apiKey?.length);
    syncProductsMutation.mutate(apiKey);
  }, [syncProductsMutation]);

  const deleteProduct = useCallback((productId: string) => {
    deleteProductMutation.mutate(productId);
  }, [deleteProductMutation]);

  return {
    products,
    isLoading: isLoading || loading,
    error,
    syncProducts,
    deleteProduct,
    isSyncing: syncProductsMutation.isPending || loading
  };
};
