
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, Trash2, ExternalLink, Settings } from 'lucide-react';
import { useWildberriesProducts } from '@/hooks/database/useWildberriesProducts';
import { useMarketplaceCredentials } from '@/hooks/database/useMarketplaceCredentials';

const WildberriesProductsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { products, isLoading, syncProducts, deleteProduct, isSyncing } = useWildberriesProducts();
  const { credentials } = useMarketplaceCredentials();
  
  const wbCreds = credentials.Wildberries || {};

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.article?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSync = () => {
    if (wbCreds?.api_key) {
      syncProducts(wbCreds.api_key);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'active': { label: 'Активный', variant: 'default' as const },
      'moderation': { label: 'Модерация', variant: 'secondary' as const },
      'blocked': { label: 'Заблокирован', variant: 'destructive' as const },
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'outline' as const };
    
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <span>📦</span>
            <span>Товары Wildberries</span>
          </span>
          <Button
            onClick={handleSync}
            disabled={!wbCreds?.api_key || isSyncing}
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Синхронизация...' : 'Синхронизировать'}
          </Button>
        </CardTitle>
        <CardDescription>
          Список товаров, загруженных из личного кабинета Wildberries
          {products.length > 0 && ` (${products.length} товаров)`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {!wbCreds?.api_key && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-yellow-800 font-medium">
                  Необходимо настроить API ключ Wildberries
                </p>
                <p className="text-yellow-700 text-sm mt-1">
                  Перейдите на вкладку "Настройки" и введите API ключ Wildberries для синхронизации товаров.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-gray-500" />
          <Input
            placeholder="Поиск по названию, SKU, артикулу или бренду..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
            <p>Загрузка товаров...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Товары не найдены</p>
            <p className="text-sm mt-1">
              {wbCreds?.api_key ? 'Нажмите "Синхронизировать" для загрузки товаров' : 'Настройте API ключ на вкладке "Настройки" для начала работы'}
            </p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Артикул</TableHead>
                  <TableHead>Размер</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Обновлен</TableHead>
                  <TableHead className="w-[100px]">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.title}</div>
                        {product.brand && (
                          <div className="text-sm text-gray-500">{product.brand}</div>
                        )}
                        {product.category && (
                          <div className="text-xs text-gray-400">{product.category}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>{product.article || '—'}</TableCell>
                    <TableCell>{product.size || '—'}</TableCell>
                    <TableCell>{getStatusBadge(product.status)}</TableCell>
                    <TableCell className="text-sm">
                      {formatDate(product.synced_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(`https://www.wildberries.ru/catalog/${product.nm_id}/detail.aspx`, '_blank')}
                          title="Открыть на Wildberries"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          title="Удалить"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {filteredProducts.length > 0 && (
          <div className="text-sm text-gray-500 text-center">
            Показано {filteredProducts.length} из {products.length} товаров
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WildberriesProductsList;
