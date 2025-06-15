
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Marketplace } from '@/types/marketplace';

interface MarketplaceCardProps {
  marketplace: Marketplace;
  onSync: (name: string) => void;
  syncInProgress: boolean;
  syncingMarketplace: string | null;
}

const getStatusIcon = (status: Marketplace['status']) => {
  switch (status) {
    case 'connected': return <CheckCircle className="w-5 h-5 text-green-600" />;
    case 'disconnected': return <XCircle className="w-5 h-5 text-red-600" />;
    case 'error': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    default: return <XCircle className="w-5 h-5 text-gray-600" />;
  }
};

const getStatusText = (status: Marketplace['status']) => {
  switch (status) {
    case 'connected': return 'Подключен';
    case 'disconnected': return 'Отключен';
    case 'error': return 'Ошибка';
    case 'not-configured': return 'Не настроен';
    default: return 'Неизвестно';
  }
};

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ marketplace, onSync, syncInProgress, syncingMarketplace }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${marketplace.color} text-white text-xl`}>
              {marketplace.icon}
            </div>
            <div>
              <CardTitle className="text-lg">{marketplace.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-1">
                {getStatusIcon(marketplace.status)}
                <span className="text-sm text-gray-600">
                  {getStatusText(marketplace.status)}
                </span>
              </div>
            </div>
          </div>
          <Button size="sm" variant="outline">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Товары:</span>
            <Badge variant="outline">{marketplace.products}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Заказы:</span>
            <Badge variant="outline">{marketplace.orders}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Последняя синхронизация:</span>
            <span className="text-xs text-gray-500">{marketplace.lastSync}</span>
          </div>
          
          <div className="flex space-x-2 pt-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onSync(marketplace.name)}
              disabled={syncInProgress || marketplace.status === 'disconnected' || marketplace.status === 'not-configured'}
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${syncInProgress && syncingMarketplace === marketplace.name ? 'animate-spin' : ''}`} />
              Синхронизировать
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MarketplaceCard;
