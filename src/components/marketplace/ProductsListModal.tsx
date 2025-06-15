
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMarketplaceCredentials } from '@/hooks/useDatabase';

interface Product {
  product_id: number;
  offer_id: string;
  name: string;
  visible: boolean;
  price: string;
}

interface ProductsListModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketplace: string;
}

const ProductsListModal: React.FC<ProductsListModalProps> = ({ isOpen, onClose, marketplace }) => {
  const { toast } = useToast();
  const { credentials } = useMarketplaceCredentials();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOzonProducts = async () => {
    const ozonCreds = credentials['Ozon'] || {};
    
    if (!ozonCreds.api_key || !ozonCreds.client_id) {
      toast({
        title: "Ошибка",
        description: "Не указаны API ключ или Client ID для Ozon",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ozon-products-list', {
        body: { 
          apiKey: ozonCreds.api_key,
          clientId: ozonCreds.client_id,
        },
      });

      if (error) throw error;

      setProducts(data.result || []);
      toast({
        title: "Успешно",
        description: `Загружено ${data.result?.length || 0} товаров с Ozon`,
      });
    } catch (error: any) {
      console.error('Error fetching Ozon products:', error);
      toast({
        title: "Ошибка загрузки товаров",
        description: error.message || "Произошла неизвестная ошибка",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProducts = () => {
    if (marketplace === 'Ozon') {
      fetchOzonProducts();
    } else {
      toast({
        title: "Функционал в разработке",
        description: `Получение товаров с ${marketplace} пока не доступно.`,
        variant: "default",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Товары {marketplace}</DialogTitle>
          <DialogDescription>
            Список товаров в каталоге {marketplace}. Используйте offer_id для сверки с вашими SKU.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Button 
            onClick={handleFetchProducts} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Загрузка...' : 'Загрузить товары'}
          </Button>

          {products.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold">Найдено товаров: {products.length}</h3>
              <div className="max-h-96 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="p-2 text-left">Offer ID</th>
                      <th className="p-2 text-left">Название</th>
                      <th className="p-2 text-left">Статус</th>
                      <th className="p-2 text-left">Цена</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.product_id} className="border-t">
                        <td className="p-2 font-mono text-xs">{product.offer_id}</td>
                        <td className="p-2">{product.name}</td>
                        <td className="p-2">
                          <Badge variant={product.visible ? "default" : "secondary"}>
                            {product.visible ? "Активен" : "Неактивен"}
                          </Badge>
                        </td>
                        <td className="p-2">{product.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductsListModal;
