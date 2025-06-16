import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, History, TrendingUp, TrendingDown, RotateCcw, ShoppingCart, Package, Edit3, User, Mail } from 'lucide-react';
import { InventoryHistory } from '@/types/database';

interface InventoryHistoryProps {
  history: InventoryHistory[];
  productFilter?: string;
}

const InventoryHistoryComponent = ({ history, productFilter }: InventoryHistoryProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getChangeTypeIcon = (type: InventoryHistory['changeType']) => {
    switch (type) {
      case 'manual': return <Edit3 className="w-4 h-4" />;
      case 'sale': return <ShoppingCart className="w-4 h-4" />;
      case 'restock': return <Package className="w-4 h-4" />;
      case 'adjustment': return <RotateCcw className="w-4 h-4" />;
      case 'return': return <TrendingUp className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getChangeTypeColor = (type: InventoryHistory['changeType']) => {
    switch (type) {
      case 'manual': return 'bg-blue-100 text-blue-800';
      case 'sale': return 'bg-red-100 text-red-800';
      case 'restock': return 'bg-green-100 text-green-800';
      case 'adjustment': return 'bg-yellow-100 text-yellow-800';
      case 'return': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getChangeTypeText = (type: InventoryHistory['changeType']) => {
    switch (type) {
      case 'manual': return 'Ручное изменение';
      case 'sale': return 'Продажа';
      case 'restock': return 'Пополнение';
      case 'adjustment': return 'Корректировка';
      case 'return': return 'Возврат';
      default: return 'Неизвестно';
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

  const filteredHistory = history.filter(item => {
    const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || item.changeType === typeFilter;
    const matchesProduct = !productFilter || item.productId === productFilter;
    
    return matchesSearch && matchesType && matchesProduct;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            История изменений остатков
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск по товару или SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
            >
              <option value="all">Все типы</option>
              <option value="manual">Ручное изменение</option>
              <option value="sale">Продажа</option>
              <option value="restock">Пополнение</option>
              <option value="adjustment">Корректировка</option>
              <option value="return">Возврат</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">История пуста</h3>
            <p className="text-gray-500">Изменения остатков будут отображаться здесь</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Товар</TableHead>
                <TableHead>Тип операции</TableHead>
                <TableHead>Было</TableHead>
                <TableHead>Стало</TableHead>
                <TableHead>Изменение</TableHead>
                <TableHead>Пользователь</TableHead>
                <TableHead>Дата и время</TableHead>
                <TableHead>Причина</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.productName}</p>
                      <p className="text-sm text-gray-500">{record.sku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getChangeTypeColor(record.changeType)}>
                      <div className="flex items-center gap-1">
                        {getChangeTypeIcon(record.changeType)}
                        {getChangeTypeText(record.changeType)}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono">{record.previousStock}</TableCell>
                  <TableCell className="font-mono">{record.newStock}</TableCell>
                  <TableCell>
                    <div className={`flex items-center gap-1 font-medium ${
                      record.changeAmount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {record.changeAmount > 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      {record.changeAmount > 0 ? '+' : ''}{record.changeAmount}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-sm font-medium">
                          {record.userName || 'Система'}
                        </span>
                      </div>
                      {record.userId && (
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            {record.userId}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(record.timestamp)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {record.reason || '—'}
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

export default InventoryHistoryComponent;
