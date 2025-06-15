
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Save } from 'lucide-react';
import { MarketplaceCredential } from '@/hooks/useDatabase';

interface OzonSettingsProps {
  creds: Partial<MarketplaceCredential>;
  updateField: (field: 'api_key' | 'client_id' | 'warehouse_id', value: string) => void;
  onCheckConnection: () => void;
  onSave: () => void;
  loading: boolean;
  saving: boolean;
  checkingConnection: boolean;
}

const OzonSettings: React.FC<OzonSettingsProps> = ({
  creds,
  updateField,
  onCheckConnection,
  onSave,
  loading,
  saving,
  checkingConnection,
}) => {
  return (
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
            value={creds.api_key || ''}
            onChange={(e) => updateField('api_key', e.target.value)}
            disabled={loading || saving}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Client ID</label>
          <Input
            placeholder="Введите Client ID"
            value={creds.client_id || ''}
            onChange={(e) => updateField('client_id', e.target.value)}
            disabled={loading || saving}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Warehouse ID</label>
          <Input
            placeholder="Введите Warehouse ID Ozon"
            value={creds.warehouse_id || ''}
            onChange={(e) => updateField('warehouse_id', e.target.value)}
            disabled={loading || saving}
          />
        </div>
        <div className="flex space-x-2">
          <Button
            className="flex-1"
            onClick={onCheckConnection}
            disabled={!creds.api_key || !creds.client_id || checkingConnection || saving || loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${checkingConnection ? 'animate-spin' : ''}`} />
            {checkingConnection ? 'Проверка...' : 'Проверить'}
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            onClick={onSave}
            disabled={saving || loading}
          >
            <Save className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OzonSettings;
