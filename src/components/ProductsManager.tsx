
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit, Trash2, Package, ExternalLink } from 'lucide-react';

const ProductsManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const products = [];

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Активен';
      case 'low_stock': return 'Мало на складе';
      case 'out_of_stock': return 'Нет в наличии';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление товарами</h1>
          <p className="text-gray-600 mt-1">Каталог товаров и синхронизация с маркетплейсами</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Добавить товар
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск по названию или артикулу..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">Фильтры</Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm ? 'Товары не найдены' : 'Нет товаров'}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? 'Попробуйте изменить критерии поиска'
                  : 'Начните с добавления первого товара в каталог'
                }
              </p>
              {!searchTerm && (
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить первый товар
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <CardDescription>Артикул: {product.sku}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(product.status)}>
                  {getStatusText(product.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Цена:</span>
                  <span className="font-bold text-lg">{product.price.toLocaleString()} ₽</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Остаток:</span>
                  <span className={`font-medium ${product.stock < 10 ? 'text-red-600' : 'text-green-600'}`}>
                    {product.stock} шт.
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Категория:</span>
                  <Badge variant="outline">{product.category}</Badge>
                </div>

                {/* Marketplace Sync Status */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Синхронизация:</p>
                  <div className="flex space-x-2">
                    <Badge className={product.ozonSynced ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                      Ozon {product.ozonSynced ? '✓' : '✗'}
                    </Badge>
                    <Badge className={product.wbSynced ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}>
                      WB {product.wbSynced ? '✓' : '✗'}
                    </Badge>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-4 h-4 mr-1" />
                    Редактировать
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Синхронизировать
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Быстрые действия</CardTitle>
          <CardDescription>Массовые операции с товарами</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center space-y-2">
              <Package className="w-6 h-6" />
              <span>Импорт товаров</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center space-y-2">
              <ExternalLink className="w-6 h-6" />
              <span>Синхронизация с Ozon</span>
            </Button>
            <Button variant="outline" className="p-4 h-auto flex flex-col items-center space-y-2">
              <ExternalLink className="w-6 h-6" />
              <span>Синхронизация с WB</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsManager;
