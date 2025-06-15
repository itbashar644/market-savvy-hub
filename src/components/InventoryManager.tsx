
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Search, AlertTriangle, Package, TrendingUp, Warehouse, History, Edit } from 'lucide-react';
import { useInventory, useInventoryHistory } from '@/hooks/useDatabase';
import InventoryHistoryComponent from './InventoryHistory';

interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  price: number;
  supplier: string;
  lastRestocked: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

const InventoryManager = () => {
  const { inventory, loading, updateStock } = useInventory();
  const { history } = useInventoryHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [editingStock, setEditingStock] = useState<{ id: string; newStock: number } | null>(null);

  const getStatusColor = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'bg-green-100 text-green-800';
      case 'low_stock': return 'bg-yellow-100 text-yellow-800';
      case 'out_of_stock': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock': return 'В наличии';
      case 'low_stock': return 'Мало товара';
      case 'out_of_stock': return 'Нет в наличии';
      default: return status;
    }
  };

  const handleStockUpdate = (productId: string, newStock: number) => {
    updateStock(productId, newStock, 'manual', 'Ручное изменение остатка');
    setEditingStock(null);
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">Загрузка остатков...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление остатками</h1>
          <p className="text-gray-600 mt-1">Отслеживайте и управляйте складскими запасами</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showHistory} onOpenChange={setShowHistory}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <History className="w-4 h-4 mr-2" />
                История изменений
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>История изменений остатков</DialogTitle>
                <DialogDescription>
                  Все изменения складских запасов с указанием времени и причины
                </DialogDescription>
              </DialogHeader>
              <InventoryHistoryComponent history={history} />
            </DialogContent>
          </Dialog>
          
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            Пополнить
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Добавить товар
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего позиций</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Мало товара</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Нет в наличии</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Warehouse className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Стоимость запасов</p>
                <p className="text-2xl font-bold text-gray-900">₽0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Складские остатки</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск по названию, SKU или категории..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredInventory.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет товаров</h3>
              <p className="text-gray-500 mb-4">Товары появятся здесь после добавления</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Добавить первый товар
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Товар</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Текущий остаток</TableHead>
                  <TableHead>Мин./Макс.</TableHead>
                  <TableHead>Цена</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Последнее пополнение</TableHead>
                  <TableHead>Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">{item.supplier}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell>
                      {editingStock?.id === item.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            value={editingStock.newStock}
                            onChange={(e) => setEditingStock({ 
                              id: item.id, 
                              newStock: parseInt(e.target.value) || 0 
                            })}
                            className="w-20"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleStockUpdate(item.id, editingStock.newStock)}
                          >
                            ✓
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => setEditingStock(null)}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${
                            item.currentStock <= item.minStock ? 'text-red-600' : 'text-gray-900'
                          }`}>
                            {item.currentStock}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingStock({ id: item.id, newStock: item.currentStock })}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {item.minStock} / {item.maxStock}
                    </TableCell>
                    <TableCell>₽{item.price.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(item.status)}>
                        {getStatusText(item.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{item.lastRestocked}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline">
                            <History className="w-3 h-3 mr-1" />
                            История
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>История изменений: {item.name}</DialogTitle>
                            <DialogDescription>
                              История изменений остатков для товара {item.sku}
                            </DialogDescription>
                          </DialogHeader>
                          <InventoryHistoryComponent 
                            history={history} 
                            productFilter={item.id}
                          />
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryManager;
