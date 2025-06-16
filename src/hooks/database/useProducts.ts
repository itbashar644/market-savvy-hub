import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<any>(null);

  const refreshProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        console.error('Error fetching products:', supabaseError);
        setError('Ошибка загрузки товаров');
        return;
      }

      const transformedData: Product[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        name: item.title,
        description: item.description,
        price: Number(item.price),
        discountPrice: item.discount_price ? Number(item.discount_price) : undefined,
        category: item.category,
        imageUrl: item.image_url,
        image: item.image_url,
        additionalImages: Array.isArray(item.additional_images) ? item.additional_images : [],
        rating: Number(item.rating),
        inStock: item.in_stock,
        colors: Array.isArray(item.colors) ? item.colors : [],
        sizes: Array.isArray(item.sizes) ? item.sizes : [],
        specifications: Array.isArray(item.specifications) ? item.specifications : [],
        isNew: item.is_new || false,
        isBestseller: item.is_bestseller || false,
        stockQuantity: item.stock_quantity || 0,
        stock: item.stock_quantity || 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        archived: item.archived || false,
        articleNumber: item.article_number,
        sku: item.article_number || item.id,
        barcode: item.barcode,
        countryOfOrigin: item.country_of_origin,
        material: item.material,
        modelName: item.model_name,
        wildberriesUrl: item.wildberries_url,
        ozonUrl: item.ozon_url,
        avitoUrl: item.avito_url,
        videoUrl: item.video_url,
        videoType: item.video_type,
        wildberriesSku: item.wildberries_sku,
        colorVariants: Array.isArray(item.color_variants) ? item.color_variants : [],
        status: item.stock_quantity <= 0 ? 'out_of_stock' : 
                item.stock_quantity <= 5 ? 'low_stock' : 'active',
        minStock: 5,
        maxStock: 100,
        supplier: 'Default',
        ozonSynced: false,
        wbSynced: !!item.wildberries_sku,
      }));

      setProducts(transformedData);
    } catch (error) {
      console.error('Error in refreshProducts:', error);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    const setupSubscription = async () => {
      await refreshProducts();
      
      if (!mounted) return;

      try {
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }

        await new Promise(resolve => setTimeout(resolve, 100));

        channelRef.current = supabase
          .channel(`products_updates_${Date.now()}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'products'
            },
            () => {
              if (mounted) {
                console.log('Products updated, refreshing...');
                refreshProducts();
              }
            }
          );

        await channelRef.current.subscribe();
        console.log('Products subscription established');
      } catch (error) {
        console.error('Error setting up products subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      mounted = false;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
        console.log('Products subscription cleaned up');
      }
    };
  }, [refreshProducts]);

  const addProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          title: product.title,
          description: product.description,
          price: product.price,
          discount_price: product.discountPrice,
          category: product.category,
          image_url: product.imageUrl,
          additional_images: product.additionalImages,
          rating: product.rating,
          in_stock: product.inStock,
          colors: product.colors,
          sizes: product.sizes,
          specifications: product.specifications,
          is_new: product.isNew,
          is_bestseller: product.isBestseller,
          stock_quantity: product.stockQuantity,
          archived: product.archived,
          article_number: product.articleNumber,
          barcode: product.barcode,
          country_of_origin: product.countryOfOrigin,
          material: product.material,
          model_name: product.modelName,
          wildberries_url: product.wildberriesUrl,
          ozon_url: product.ozonUrl,
          avito_url: product.avitoUrl,
          video_url: product.videoUrl,
          video_type: product.videoType,
          wildberries_sku: product.wildberriesSku,
          color_variants: product.colorVariants,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding product:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in addProduct:', error);
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.price = updates.price;
      if (updates.discountPrice !== undefined) updateData.discount_price = updates.discountPrice;
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl;
      if (updates.additionalImages !== undefined) updateData.additional_images = updates.additionalImages;
      if (updates.rating !== undefined) updateData.rating = updates.rating;
      if (updates.inStock !== undefined) updateData.in_stock = updates.inStock;
      if (updates.colors !== undefined) updateData.colors = updates.colors;
      if (updates.sizes !== undefined) updateData.sizes = updates.sizes;
      if (updates.specifications !== undefined) updateData.specifications = updates.specifications;
      if (updates.isNew !== undefined) updateData.is_new = updates.isNew;
      if (updates.isBestseller !== undefined) updateData.is_bestseller = updates.isBestseller;
      if (updates.stockQuantity !== undefined) updateData.stock_quantity = updates.stockQuantity;
      if (updates.archived !== undefined) updateData.archived = updates.archived;
      if (updates.articleNumber !== undefined) updateData.article_number = updates.articleNumber;
      if (updates.barcode !== undefined) updateData.barcode = updates.barcode;
      if (updates.countryOfOrigin !== undefined) updateData.country_of_origin = updates.countryOfOrigin;
      if (updates.material !== undefined) updateData.material = updates.material;
      if (updates.modelName !== undefined) updateData.model_name = updates.modelName;
      if (updates.wildberriesUrl !== undefined) updateData.wildberries_url = updates.wildberriesUrl;
      if (updates.ozonUrl !== undefined) updateData.ozon_url = updates.ozonUrl;
      if (updates.avitoUrl !== undefined) updateData.avito_url = updates.avitoUrl;
      if (updates.videoUrl !== undefined) updateData.video_url = updates.videoUrl;
      if (updates.videoType !== undefined) updateData.video_type = updates.videoType;
      if (updates.wildberriesSku !== undefined) updateData.wildberries_sku = updates.wildberriesSku;
      if (updates.colorVariants !== undefined) updateData.color_variants = updates.colorVariants;
      
      if (updates.stock !== undefined) updateData.stock_quantity = updates.stock;

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in updateProduct:', error);
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting product:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
      return false;
    }
  };

  const deleteProducts = async (ids: string[]) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .in('id', ids);

      if (error) {
        console.error('Error deleting products:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in deleteProducts:', error);
      return false;
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteProducts,
    refreshProducts,
  };
};
