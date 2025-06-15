
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { Search } from 'lucide-react';
import { Order } from '@/types/database';
import OrderTableRow from './OrderTableRow';
import OrdersEmptyState from './OrdersEmptyState';

interface OrdersTableProps {
  orders: Order[];
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  editingOrderId: string | null;
  newStatus: Order['status'];
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
  onNewStatusChange: (status: Order['status']) => void;
  onEditStart: (orderId: string, status: Order['status']) => void;
  onEditCancel: () => void;
  onShowHistory: (order: Order) => void;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  searchTerm,
  onSearchTermChange,
  ...rowProps
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle>Список заказов</CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Поиск по клиенту или номеру заказа..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 w-full md:w-80"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <OrdersEmptyState />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Номер заказа</TableHead>
                <TableHead>Клиент</TableHead>
                <TableHead>Товары</TableHead>
                <TableHead>Сумма</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Источник</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <OrderTableRow
                  key={order.id}
                  order={order}
                  {...rowProps}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default OrdersTable;
