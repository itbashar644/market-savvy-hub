
export interface ProductForUpdate {
  wildberries_sku?: string;
  nm_id?: string;
  stock?: number;
  currentStock?: number;
  sku?: string;
  offer_id?: string;
  name?: string;
  category?: string;
}

export interface ValidatedProduct {
  wbSku: string;
  originalSku: string;
  stock: number;
  productName: string;
  category: string;
}

export const useWildberriesStockValidator = () => {
  const validateAndFilterProducts = (products: ProductForUpdate[]): {
    validProducts: ValidatedProduct[];
    invalidCount: number;
  } => {
    console.log('🚀 Starting Wildberries stock validation with products:', products.length);
    
    const validProducts: ValidatedProduct[] = [];
    let invalidCount = 0;

    products.forEach(p => {
      const wbSku = p.wildberries_sku || p.nm_id;
      const hasWbSku = wbSku && String(wbSku).trim() !== '';
      
      if (!hasWbSku) {
        console.log(`⚠️ Пропускаем товар ${p.sku || p.offer_id} - нет Wildberries SKU`);
        invalidCount++;
        return;
      }

      const validatedProduct: ValidatedProduct = {
        wbSku: String(wbSku),
        originalSku: p.sku || p.offer_id || 'N/A',
        stock: p.stock || p.currentStock || 0,
        productName: p.name || 'N/A',
        category: p.category || 'N/A'
      };

      console.log(`📋 WB SKU: ${validatedProduct.wbSku}, исходный SKU: ${validatedProduct.originalSku}, остаток: ${validatedProduct.stock}, название: ${validatedProduct.productName}`);
      
      validProducts.push(validatedProduct);
    });

    console.log(`📋 Товары для обновления: ${validProducts.length} из ${products.length}`);
    
    return { validProducts, invalidCount };
  };

  return { validateAndFilterProducts };
};
