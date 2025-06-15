
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, FileText } from 'lucide-react';
import { OrderStatusHistory as OrderStatusHistoryType } from '@/types/database';

interface OrderStatusHistoryProps {
  history: OrderStatusHistoryType[];
}

const OrderStatusHistory: React.FC<OrderStatusHistoryProps> = ({ history }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает';
      case 'processing': return 'Обработка';
      case 'shipped': return 'Отправлен';
      case 'delivered': return 'Доставлен';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            История статусов
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">История статусов пуста</p>
        </CardContent>
      </Card>
    );
  }

  // Сортируем историю по времени (новые записи сверху)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          История статусов
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedHistory.map((historyItem, index) => (
            <div key={historyItem.id} className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-3 h-3 bg-blue-500 rounded-full mt-2"></div>
                {index < sortedHistory.length - 1 && (
                  <div className="w-0.5 h-8 bg-gray-200 mx-auto mt-2"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {historyItem.fromStatus && (
                    <>
                      <Badge className={getStatusColor(historyItem.fromStatus)}>
                        {getStatusText(historyItem.fromStatus)}
                      </Badge>
                      <span className="text-gray-400">→</span>
                    </>
                  )}
                  <Badge className={getStatusColor(historyItem.toStatus)}>
                    {getStatusText(historyItem.toStatus)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatDate(historyItem.changedAt)}
                  </div>
                  
                  {historyItem.changedBy && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {historyItem.changedBy}
                    </div>
                  )}
                </div>
                
                {historyItem.notes && (
                  <div className="mt-2 flex items-start gap-1">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="text-sm text-gray-600">{historyItem.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusHistory;
