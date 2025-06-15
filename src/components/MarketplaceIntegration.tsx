import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Settings,
  Save,
  ExternalLink,
  Upload,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useInventory, useMarketplaceCredentials } from '@/hooks/useDatabase';
import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';

const MarketplaceIntegration = () => {
  const { toast } = useToast();
  const { inventory } = useInventory();
  const { credentials, loading: credentialsLoading, saving, updateCredentialField, saveCredentials } = useMarketplaceCredentials();
  
  const ozonCreds = credentials['Ozon'] || {};
  const wbCreds = credentials['Wildberries'] || {};

  const [autoSync, setAutoSync] = useState(true);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncingMarketplace, setSyncingMarketplace] = useState<string | null>(null);
  const [checkingConnection, setCheckingConnection] = useState<string | null>(null);

  const marketplaces = [
    {
      name: 'Ozon',
      status: 'connected',
      lastSync: '2024-01-15 14:30',
      products: 156,
      orders: 23,
      color: 'bg-blue-600',
      icon: '🛍️'
    },
    {
      name: 'Wildberries',
      status: 'connected',
      lastSync: '2024-01-15 14:25',
      products: 142,
      orders: 18,
      color: 'bg-purple-600',
      icon: '🛒'
    },
    {
      name: 'Яндекс.Маркет',
      status: 'disconnected',
      lastSync: 'Никогда',
      products: 0,
      orders: 0,
      color: 'bg-yellow-600',
      icon: '🏪'
    }
  ];

  const syncLogs = [
    {
      id: 1,
      marketplace: 'Ozon',
      action: 'Обновление остатков',
      status: 'success',
      timestamp: '2024-01-15 14:30:15',
      details: 'Обновлено 45 товаров'
    },
    {
      id: 2,
      marketplace: 'Wildberries',
      action: 'Загрузка заказов',
      status: 'success',
      timestamp: '2024-01-15 14:25:32',
      details: 'Загружено 12 новых заказов'
    },
    {
      id: 3,
      marketplace: 'Ozon',
      action: 'Обновление цен',
      status: 'error',
      timestamp: '2024-01-15 14:20:45',
      details: 'Ошибка API: недействительный ключ'
    }
  ];

  const handleSync = async (marketplace: string) => {
    if (marketplace !== 'Ozon') {
      toast({
        title: "Функционал в разработке",
        description: `Синхронизация с ${marketplace} пока не доступна.`,
        variant: "default",
      });
      return;
    }

    if (!ozonCreds.warehouse_id) {
      toast({
        title: "Не указан Warehouse ID",
        description: "Пожалуйста, укажите и сохраните Warehouse ID в настройках Ozon.",
        variant: "destructive",
      });
      return;
    }

    setSyncInProgress(true);
    setSyncingMarketplace(marketplace);

    const stocks = inventory.map(item => ({
      offer_id: item.sku,
      stock: item.currentStock,
    }));

    try {
      const { data, error } = await supabase.functions.invoke('ozon-stock-sync', {
        body: { stocks, warehouseId: ozonCreds.warehouse_id },
      });

      if (error) throw error;
      
      const ozonResult = data.result;
      const failedUpdates = ozonResult.filter((r: { updated: boolean; }) => !r.updated);

      if (failedUpdates.length > 0) {
        console.error('Failed Ozon updates:', failedUpdates);
        toast({
          title: "Ошибка синхронизации с Ozon",
          description: `Не удалось обновить ${failedUpdates.length} товаров. Подробности в консоли.`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Синхронизация с Ozon завершена",
          description: `Остатки для ${stocks.length} товаров успешно отправлены.`,
        });
      }

    } catch (error: any) {
      console.error('Error syncing with Ozon:', error);
      let description = "Произошла неизвестная ошибка.";

      if (error instanceof FunctionsHttpError) {
        try {
          const errorJson = await error.context.json();
          description = errorJson.error || JSON.stringify(errorJson);
        } catch {
          description = error.context.statusText || 'Не удалось получить детали ошибки от сервера.';
        }
      } else {
        description = error.message;
      }

      toast({
        title: "Ошибка синхронизации с Ozon",
        description,
        variant: "destructive"
      });
    } finally {
      setSyncInProgress(false);
      setSyncingMarketplace(null);
    }
  };

  const handleCheckConnection = async (marketplace: string) => {
    setCheckingConnection(marketplace);
    let apiKey, clientId;

    try {
      if (marketplace === 'Ozon') {
        apiKey = ozonCreds.api_key;
        clientId = ozonCreds.client_id;
        if (!apiKey || !clientId) {
          toast({
            title: "Не указаны обязательные поля",
            description: "Пожалуйста, укажите API ключ и Client ID для Ozon.",
            variant: "destructive",
          });
          setCheckingConnection(null);
          return;
        }

        const { data, error } = await supabase.functions.invoke('ozon-connection-check', {
          body: { 
            apiKey, 
            clientId
          },
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "Подключение к Ozon",
            description: data.message,
            variant: "default",
          });
        } else {
          toast({
            title: "Ошибка подключения к Ozon",
            description: data.error,
            variant: "destructive",
          });
        }
      } else if (marketplace === 'Wildberries') {
        apiKey = wbCreds.api_key;
        if (!apiKey) {
          toast({
            title: "Не указан API ключ",
            description: "Пожалуйста, укажите API ключ для Wildberries.",
            variant: "destructive",
          });
          setCheckingConnection(null);
          return;
        }

        const { data, error } = await supabase.functions.invoke('wildberries-connection-check', {
          body: { apiKey },
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "Подключение к Wildberries",
            description: data.message,
            variant: "default",
          });
        } else {
          toast({
            title: "Ошибка подключения к Wildberries",
            description: data.error,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Функционал в разработке",
          description: `Проверка подключения для ${marketplace} пока не доступна.`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error checking connection:', error);
      toast({
        title: "Ошибка проверки подключения",
        description: error.message || "Произошла неизвестная ошибка.",
        variant: "destructive"
      });
    } finally {
      setCheckingConnection(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'disconnected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'error': return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default: return <XCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Подключен';
      case 'disconnected': return 'Отключен';
      case 'error': return 'Ошибка';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Интеграция с маркетплейсами</h1>
          <p className="text-gray-600 mt-1">Управление подключениями и синхронизацией данных</p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Автосинхронизация:</span>
          <Switch
            checked={autoSync}
            onCheckedChange={setAutoSync}
          />
        </div>
      </div>

      {/* Marketplace Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {marketplaces.map((marketplace, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
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
                    onClick={() => handleSync(marketplace.name)}
                    disabled={syncInProgress || marketplace.status === 'disconnected'}
                  >
                    <RefreshCw className={`w-4 h-4 mr-1 ${syncInProgress && syncingMarketplace === marketplace.name ? 'animate-spin' : ''}`} />
                    Синхронизировать
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="settings">Настройки API</TabsTrigger>
          <TabsTrigger value="logs">Логи синхронизации</TabsTrigger>
          <TabsTrigger value="rules">Правила обновления</TabsTrigger>
        </TabsList>

        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Ozon Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🛍️</span>
                  <span>Настройки Ozon</span>
                </CardTitle>
                <CardDescription>Конфигурация API для интеграции с Ozon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">API ключ</label>
                  <Input
                    type="password"
                    placeholder="Введите API ключ Ozon"
                    value={ozonCreds.api_key || ''}
                    onChange={(e) => updateCredentialField('Ozon', 'api_key', e.target.value)}
                    disabled={credentialsLoading || saving}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Client ID</label>
                  <Input
                    placeholder="Введите Client ID"
                    value={ozonCreds.client_id || ''}
                    onChange={(e) => updateCredentialField('Ozon', 'client_id', e.target.value)}
                    disabled={credentialsLoading || saving}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Warehouse ID</label>
                  <Input
                    placeholder="Введите Warehouse ID Ozon"
                    value={ozonCreds.warehouse_id || ''}
                    onChange={(e) => updateCredentialField('Ozon', 'warehouse_id', e.target.value)}
                    disabled={credentialsLoading || saving}
                  />
                </div>
                <div className="flex space-x-2">
                  <Button
                    className="flex-1"
                    onClick={() => handleCheckConnection('Ozon')}
                    disabled={!ozonCreds.api_key || !ozonCreds.client_id || checkingConnection === 'Ozon' || saving || credentialsLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${checkingConnection === 'Ozon' ? 'animate-spin' : ''}`} />
                    {checkingConnection === 'Ozon' ? 'Проверка...' : 'Проверить'}
                  </Button>
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => saveCredentials('Ozon')}
                    disabled={saving || credentialsLoading}
                  >
                    <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wildberries Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <span>🛒</span>
                  <span>Настройки Wildberries</span>
                </CardTitle>
                <CardDescription>Конфигурация API для интеграции с Wildberries</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">API ключ</label>
                  <Input
                    type="password"
                    placeholder="Введите API ключ Wildberries"
                    value={wbCreds.api_key || ''}
                    onChange={(e) => updateCredentialField('Wildberries', 'api_key', e.target.value)}
                    disabled={credentialsLoading || saving}
                  />
                </div>
                <div className="flex space-x-2">
                   <Button
                    className="flex-1"
                    onClick={() => handleCheckConnection('Wildberries')}
                    disabled={!wbCreds.api_key || checkingConnection === 'Wildberries' || saving || credentialsLoading}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${checkingConnection === 'Wildberries' ? 'animate-spin' : ''}`} />
                    {checkingConnection === 'Wildberries' ? 'Проверка...' : 'Проверить'}
                  </Button>
                   <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => saveCredentials('Wildberries')}
                    disabled={saving || credentialsLoading}
                  >
                    <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                    {saving ? 'Сохранение...' : 'Сохранить'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>История синхронизации</CardTitle>
              <CardDescription>Последние операции с маркетплейсами</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        log.status === 'success' ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {log.status === 'success' ? 
                          <CheckCircle className="w-4 h-4 text-green-600" /> :
                          <XCircle className="w-4 h-4 text-red-600" />
                        }
                      </div>
                      <div>
                        <p className="font-medium">{log.marketplace} - {log.action}</p>
                        <p className="text-sm text-gray-600">{log.details}</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">{log.timestamp}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Правила автоматического обновления</CardTitle>
              <CardDescription>Настройте условия для автоматической синхронизации данных</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Обновлять остатки каждые:</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>15 минут</option>
                    <option>30 минут</option>
                    <option>1 час</option>
                    <option>3 часа</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Обновлять цены каждые:</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>1 час</option>
                    <option>3 часа</option>
                    <option>6 часов</option>
                    <option>12 часов</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <span className="text-sm">Автоматически загружать новые заказы</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch defaultChecked />
                <span className="text-sm">Уведомлять об ошибках синхронизации</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MarketplaceIntegration;
