
import React from 'react';
import { Order } from '@/types/database';
import { TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Clock, Eye, Edit } from 'lucide-react';

interface OrderTableRowProps {
  order: Order;
  editingOrderId: string | null;
  newStatus: Order['status'];
  onStatusUpdate: (orderId: string, status: Order['status']) => void;
  onNewStatusChange: (status: Order['status']) => void;
  onEditStart: (orderId: string, status: Order['status']) => void;
  onEditCancel: () => void;
  onShowHistory: (order: Order) => void;
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800';
    case 'processing': return 'bg-blue-100 text-blue-800';
    case 'shipped': return 'bg-purple-100 text-purple-800';
    case 'delivered': return 'bg-green-100 text-green-800';
    case 'cancelled': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: Order['status']) => {
  switch (status) {
    case 'pending': return 'Ожидает';
    case 'processing': return 'Обработка';
    case 'shipped': return 'Отправлен';
    case 'delivered': return 'Доставлен';
    case 'cancelled': return 'Отменен';
    default: return status;
  }
};

const OrderTableRow: React.FC<OrderTableRowProps> = ({
  order,
  editingOrderId,
  newStatus,
  onStatusUpdate,
  onNewStatusChange,
  onEditStart,
  onEditCancel,
  onShowHistory,
}) => {
  return (
    <TableRow>
      <TableCell className="font-medium">{order.orderNumber}</TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{order.customerName}</p>
          <p className="text-sm text-gray-500">{order.customerEmail}</p>
        </div>
      </TableCell>
      <TableCell>
        <div className="max-w-xs">
          {order.products.map(p => p.productName).join(', ')}
        </div>
      </TableCell>
      <TableCell>₽{order.total.toLocaleString()}</TableCell>
      <TableCell>
        {editingOrderId === order.id ? (
          <div className="flex items-center gap-2">
            <Select
              value={newStatus}
              onValueChange={(value) => onNewStatusChange(value as Order['status'])}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Ожидает</SelectItem>
                <SelectItem value="processing">Обработка</SelectItem>
                <SelectItem value="shipped">Отправлен</SelectItem>
                <SelectItem value="delivered">Доставлен</SelectItem>
                <SelectItem value="cancelled">Отменен</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              size="sm" 
              onClick={() => onStatusUpdate(order.id, newStatus)}
            >
              ✓
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onEditCancel}
            >
              ✕
            </Button>
          </div>
        ) : (
          <Badge className={getStatusColor(order.status)}>
            {getStatusText(order.status)}
          </Badge>
        )}
      </TableCell>
      <TableCell>{order.source || 'CRM'}</TableCell>
      <TableCell>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</TableCell>
      <TableCell>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onShowHistory(order)}
          >
            <Clock className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onEditStart(order.id, order.status)}
          >
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default OrderTableRow;
