
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';
import { toast } from 'sonner';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const subscriptionRef = useRef<any>(null);
  const isMountedRef = useRef(true);

  const fetchProducts = async () => {
    try {
      console.log('🔍 [useProducts] Загружаем товары из Supabase...');
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ [useProducts] Ошибка загрузки товаров:', error);
        throw error;
      }

      console.log('✅ [useProducts] Загружено товаров из Supabase:', data?.length || 0);
      
      // Маппим данные из Supabase в формат Product с правильной обработкой типов
      const mappedProducts: Product[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        name: item.title, // Для обратной совместимости
        description: item.description,
        price: Number(item.price),
        discountPrice: item.discount_price ? Number(item.discount_price) : undefined,
        category: item.category,
        imageUrl: item.image_url,
        image: item.image_url, // Для обратной совместимости
        additionalImages: Array.isArray(item.additional_images) ? item.additional_images : [],
        rating: Number(item.rating),
        inStock: item.in_stock,
        colors: Array.isArray(item.colors) ? item.colors : [],
        sizes: Array.isArray(item.sizes) ? item.sizes : [],
        specifications: typeof item.specifications === 'object' && item.specifications !== null ? item.specifications : {},
        isNew: item.is_new,
        isBestseller: item.is_bestseller,
        stockQuantity: item.stock_quantity || 0,
        stock: item.stock_quantity || 0, // Для обратной совместимости
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        archived: item.archived,
        articleNumber: item.article_number,
        sku: item.article_number, // Используем article_number как SKU
        barcode: item.barcode,
        countryOfOrigin: item.country_of_origin || 'Не указано',
        material: item.material,
        modelName: item.model_name,
        wildberriesUrl: item.wildberries_url,
        ozonUrl: item.ozon_url,
        avitoUrl: item.avito_url,
        videoUrl: item.video_url,
        videoType: item.video_type,
        wildberriesSku: item.wildberries_sku,
        colorVariants: typeof item.color_variants === 'object' && item.color_variants !== null ? item.color_variants : {},
        status: item.in_stock ? 'active' : 'out_of_stock',
        minStock: 0,
        maxStock: 100,
        supplier: 'Default',
        // Добавляем поля для совместимости с marketplace
        ozonSynced: false,
        wbSynced: !!item.wildberries_sku
      }));

      if (isMountedRef.current) {
        setProducts(mappedProducts);
        console.log('🔍 [useProducts] Первые 5 товаров:', mappedProducts.slice(0, 5).map(p => ({
          id: p.id,
          title: p.title?.substring(0, 30) + '...',
          sku: p.sku,
          articleNumber: p.articleNumber,
          wildberriesSku: p.wildberriesSku
        })));
      }
      
      return mappedProducts;
    } catch (error) {
      console.error('💥 [useProducts] Критическая ошибка:', error);
      toast.error('Ошибка загрузки товаров');
      return [];
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      console.log('➕ [useProducts] Добавляем товар в Supabase...');
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: productData.title,
          description: productData.description,
          price: productData.price,
          discount_price: productData.discountPrice,
          category: productData.category,
          image_url: productData.imageUrl || '/placeholder.svg',
          additional_images: productData.additionalImages,
          rating: productData.rating || 4.8,
          in_stock: productData.inStock !== false,
          colors: productData.colors,
          sizes: productData.sizes,
          specifications: productData.specifications,
          is_new: productData.isNew,
          is_bestseller: productData.isBestseller,
          stock_quantity: productData.stockQuantity || productData.stock || 0,
          archived: productData.archived,
          article_number: productData.sku || productData.articleNumber,
          barcode: productData.barcode,
          country_of_origin: productData.countryOfOrigin || 'Не указано',
          material: productData.material,
          model_name: productData.modelName,
          wildberries_url: productData.wildberriesUrl,
          ozon_url: productData.ozonUrl,
          avito_url: productData.avitoUrl,
          video_url: productData.videoUrl,
          video_type: productData.videoType,
          wildberries_sku: productData.wildberriesSku,
          color_variants: productData.colorVariants
        })
        .select()
        .single();

      if (error) throw error;

      console.log('✅ [useProducts] Товар добавлен:', data.id);
      await fetchProducts(); // Перезагружаем список
      toast.success('Товар добавлен успешно');
      return data;
    } catch (error) {
      console.error('❌ [useProducts] Ошибка добавления товара:', error);
      toast.error('Ошибка добавления товара');
      throw error;
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    console.log(`🔄 [useProducts] Обновляем товар ${id} локально:`, updates);
    
    setProducts(prevProducts => {
      const updatedProducts = prevProducts.map(product => {
        if (product.id === id) {
          const updatedProduct = { ...product, ...updates };
          console.log(`✅ [useProducts] Товар ${id} обновлен локально:`, {
            id: updatedProduct.id,
            title: updatedProduct.title?.substring(0, 30) + '...',
            wildberriesSku: updatedProduct.wildberriesSku
          });
          return updatedProduct;
        }
        return product;
      });
      return updatedProducts;
    });

    // Асинхронно обновляем в Supabase
    updateProductInSupabase(id, updates);
    return true;
  };

  const updateProductInSupabase = async (id: string, updates: Partial<Product>) => {
    try {
      console.log(`🔄 [useProducts] Обновляем товар ${id} в Supabase:`, updates);
      
      const updateData: any = {};
      
      if (updates.title) updateData.title = updates.title;
      if (updates.description) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.discountPrice !== undefined) updateData.discount_price = updates.discountPrice;
      if (updates.category) updateData.category = updates.category;
      if (updates.imageUrl) updateData.image_url = updates.imageUrl;
      if (updates.wildberriesSku !== undefined) updateData.wildberries_sku = updates.wildberriesSku;
      if (updates.stockQuantity !== undefined) updateData.stock_quantity = updates.stockQuantity;
      if (updates.stock !== undefined) updateData.stock_quantity = updates.stock;
      if (updates.inStock !== undefined) updateData.in_stock = updates.inStock;
      
      const { error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
      
      console.log(`✅ [useProducts] Товар ${id} успешно обновлен в Supabase`);
    } catch (error) {
      console.error(`❌ [useProducts] Ошибка обновления товара ${id} в Supabase:`, error);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      console.log(`🗑️ [useProducts] Удаляем товар ${id}...`);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchProducts();
      toast.success('Товар удален');
      return true;
    } catch (error) {
      console.error('❌ [useProducts] Ошибка удаления товара:', error);
      toast.error('Ошибка удаления товара');
      return false;
    }
  };

  const deleteProducts = async (ids: string[]) => {
    try {
      console.log(`🗑️ [useProducts] Удаляем товары:`, ids);
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);

      if (error) throw error;

      await fetchProducts();
      toast.success(`Удалено товаров: ${ids.length}`);
      return true;
    } catch (error) {
      console.error('❌ [useProducts] Ошибка удаления товаров:', error);
      toast.error('Ошибка удаления товаров');
      return false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    
    const initializeProducts = async () => {
      await fetchProducts();
    };
    
    initializeProducts();
    
    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        console.log('🔄 [useProducts] Отписываемся от канала:', subscriptionRef.current);
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, []);

  // Отдельный useEffect для подписки на изменения
  useEffect(() => {
    if (products.length > 0 && !subscriptionRef.current) {
      const channelName = `products-realtime-${Math.random().toString(36).substr(2, 9)}`;
      console.log('🔄 [useProducts] Создаем подписку на канал:', channelName);
      
      subscriptionRef.current = supabase
        .channel(channelName)
        .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'products' },
          (payload) => {
            console.log('🔄 [useProducts] Изменение в products:', payload);
            if (isMountedRef.current) {
              fetchProducts();
            }
          }
        )
        .subscribe();
    }
    
    return () => {
      // Cleanup будет выполнен в основном useEffect
    };
  }, [products.length]);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    refreshProducts: fetchProducts
  };
};
