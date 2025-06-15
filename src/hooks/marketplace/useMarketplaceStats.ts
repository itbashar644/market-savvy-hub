
import { useProducts } from '@/hooks/database/useProducts';
import { useOrders } from '@/hooks/database/useOrders';

export const useMarketplaceStats = () => {
  const { products } = useProducts();
  const { orders } = useOrders();

  const getMarketplaceStats = () => {
    // Для товаров используем приблизительное распределение, так как нет поля marketplace
    const totalProducts = products.filter(p => p.status === 'active').length;
    const ozonProducts = Math.floor(totalProducts * 0.4); // Примерно 40% товаров на Ozon
    const wbProducts = Math.floor(totalProducts * 0.6); // Примерно 60% товаров на WB
    
    // Для заказов используем поле source
    const ozonOrders = orders.filter(o => 
      o.source === 'Ozon' || 
      o.source === 'ozon'
    ).length;
    
    const wbOrders = orders.filter(o => 
      o.source === 'Wildberries' || 
      o.source === 'wb' || 
      o.source === 'WB'
    ).length;
    
    return {
      ozon: { products: ozonProducts, orders: ozonOrders },
      wb: { products: wbProducts, orders: wbOrders }
    };
  };

  return { getMarketplaceStats };
};
