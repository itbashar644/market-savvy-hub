
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Package, History } from 'lucide-react';
import { InventoryItem, InventoryHistory } from '@/types/database';
import InventoryHistoryComponent from '../InventoryHistory';
import StockEditor from './StockEditor';
import SortableTableHeader from './SortableTableHeader';

interface InventoryTableProps {
  inventory: InventoryItem[];
  history: InventoryHistory[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  editingStock: { productId: string; newStock: number } | null;
  setEditingStock: (editing: { productId: string; newStock: number } | null) => void;
  onStockUpdate: (productId: string, newStock: number) => void;
}

const InventoryTable = ({ 
  inventory, 
  history, 
  searchTerm, 
  setSearchTerm, 
  editingStock, 
  setEditingStock, 
  onStockUpdate 
}: InventoryTableProps) => {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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

  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Moscow',
      };
      return new Intl.DateTimeFormat('ru-RU', options).format(date);
    } catch (e) {
      console.error("Invalid date:", dateString);
      return dateString;
    }
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFilteredInventory = useMemo(() => {
    // Сначала фильтруем
    let filtered = inventory.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Затем сортируем
    if (sortConfig) {
      filtered.sort((a, b) => {
        let aValue: any = a[sortConfig.key as keyof InventoryItem];
        let bValue: any = b[sortConfig.key as keyof InventoryItem];

        // Специальная обработка для разных типов данных
        if (sortConfig.key === 'currentStock' || sortConfig.key === 'price') {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        } else if (sortConfig.key === 'lastRestocked') {
          aValue = new Date(aValue || 0);
          bValue = new Date(bValue || 0);
        } else {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [inventory, searchTerm, sortConfig]);

  return (
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
        {sortedAndFilteredInventory.length === 0 ? (
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
                <SortableTableHeader
                  title="SKU"
                  sortKey="sku"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  title="Текущий остаток"
                  sortKey="currentStock"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  title="Товар"
                  sortKey="name"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  title="Категория"
                  sortKey="category"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  title="Цена"
                  sortKey="price"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  title="Статус"
                  sortKey="status"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <SortableTableHeader
                  title="Последнее изменение"
                  sortKey="lastRestocked"
                  currentSort={sortConfig}
                  onSort={handleSort}
                />
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFilteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-sm">{item.sku}</TableCell>
                  <TableCell>
                    <StockEditor
                      productId={item.productId}
                      currentStock={item.currentStock}
                      status={item.status}
                      editingStock={editingStock}
                      setEditingStock={setEditingStock}
                      onStockUpdate={onStockUpdate}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.supplier}</p>
                    </div>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>₽{item.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusText(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(item.lastRestocked)}</TableCell>
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
                          productFilter={item.productId}
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
  );
};

export default InventoryTable;
