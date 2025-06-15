
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useOrders } from '@/hooks/useDatabase';
import { Order } from '@/types/database';
import OrderStatusHistory from '@/components/orders/OrderStatusHistory';
import OrdersHeader from './orders/OrdersHeader';
import OrderStats from './orders/OrderStats';
import OrdersTable from './orders/OrdersTable';

const OrdersManager = () => {
  const { orders, loading, updateOrder, getOrderWithHistory } = useOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showStatusHistory, setShowStatusHistory] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<Order['status']>('pending');

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusUpdate = (orderId: string, status: Order['status']) => {
    updateOrder(orderId, { status });
    setEditingOrderId(null);
  };

  const handleShowHistory = (order: Order) => {
    const orderWithHistory = getOrderWithHistory(order.id);
    setSelectedOrder(orderWithHistory);
    setShowStatusHistory(true);
  };
  
  const handleEditStart = (orderId: string, status: Order['status']) => {
    setEditingOrderId(orderId);
    setNewStatus(status);
  }

  const getTotalsByStatus = () => {
    return {
      total: orders.length,
      processing: orders.filter(o => o.status === 'processing').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      totalAmount: orders.reduce((sum, order) => sum + order.total, 0)
    };
  };

  const stats = getTotalsByStatus();

  if (loading) {
    return <div className="p-6">Загрузка...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <OrdersHeader />
      <OrderStats stats={stats} />
      <OrdersTable 
        orders={filteredOrders}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        editingOrderId={editingOrderId}
        newStatus={newStatus}
        onStatusUpdate={handleStatusUpdate}
        onNewStatusChange={setNewStatus}
        onEditStart={handleEditStart}
        onEditCancel={() => setEditingOrderId(null)}
        onShowHistory={handleShowHistory}
      />

      <Dialog open={showStatusHistory} onOpenChange={setShowStatusHistory}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              История статусов заказа {selectedOrder?.orderNumber}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderStatusHistory history={selectedOrder.statusHistory || []} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersManager;
