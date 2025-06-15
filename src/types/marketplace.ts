
export interface Marketplace {
  name: 'Ozon' | 'Wildberries' | 'Яндекс.Маркет';
  status: 'connected' | 'disconnected' | 'error' | 'not-configured';
  lastSync: string;
  products: number;
  orders: number;
  color: string;
  icon: string;
}

export interface SyncLog {
  id: number;
  marketplace: string;
  action: string;
  status: 'success' | 'error';
  timestamp: string;
  details: string;
}
