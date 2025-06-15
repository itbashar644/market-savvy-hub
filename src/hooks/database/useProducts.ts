
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { Product } from '@/types/database';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshProducts = () => {
    setProducts(db.getProducts());
    setLoading(false);
  };

  useEffect(() => {
    refreshProducts();
  }, []);

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct = db.addProduct(product);
    refreshProducts();
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const updated = db.updateProduct(id, updates);
    refreshProducts();
    return updated;
  };

  const deleteProduct = (id: string) => {
    const success = db.deleteProduct(id);
    refreshProducts();
    return success;
  };

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
  };
};
