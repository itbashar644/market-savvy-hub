
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types/database';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshProducts = async () => {
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

      // Transform Supabase data to match our Product type
      const transformedData: Product[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: Number(item.price),
        discountPrice: item.discount_price ? Number(item.discount_price) : undefined,
        category: item.category,
        imageUrl: item.image_url,
        additionalImages: item.additional_images || [],
        rating: Number(item.rating),
        inStock: item.in_stock,
        colors: item.colors || [],
        sizes: item.sizes || [],
        specifications: item.specifications || [],
        isNew: item.is_new || false,
        isBestseller: item.is_bestseller || false,
        stockQuantity: item.stock_quantity || 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        archived: item.archived || false,
        articleNumber: item.article_number,
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
        colorVariants: item.color_variants || [],
      }));

      setProducts(transformedData);
    } catch (error) {
      console.error('Error in refreshProducts:', error);
      setError('Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshProducts();

    // Set up real-time subscription
    const channel = supabase
      .channel('products_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'products'
        },
        () => {
          refreshProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

      await refreshProducts();
      return data;
    } catch (error) {
      console.error('Error in addProduct:', error);
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          title: updates.title,
          description: updates.description,
          price: updates.price,
          discount_price: updates.discountPrice,
          category: updates.category,
          image_url: updates.imageUrl,
          additional_images: updates.additionalImages,
          rating: updates.rating,
          in_stock: updates.inStock,
          colors: updates.colors,
          sizes: updates.sizes,
          specifications: updates.specifications,
          is_new: updates.isNew,
          is_bestseller: updates.isBestseller,
          stock_quantity: updates.stockQuantity,
          archived: updates.archived,
          article_number: updates.articleNumber,
          barcode: updates.barcode,
          country_of_origin: updates.countryOfOrigin,
          material: updates.material,
          model_name: updates.modelName,
          wildberries_url: updates.wildberriesUrl,
          ozon_url: updates.ozonUrl,
          avito_url: updates.avitoUrl,
          video_url: updates.videoUrl,
          video_type: updates.videoType,
          wildberries_sku: updates.wildberriesSku,
          color_variants: updates.colorVariants,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating product:', error);
        return null;
      }

      await refreshProducts();
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

      await refreshProducts();
      return true;
    } catch (error) {
      console.error('Error in deleteProduct:', error);
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
    refreshProducts,
  };
};
