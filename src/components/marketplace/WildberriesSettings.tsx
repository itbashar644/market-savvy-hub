
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, Save } from 'lucide-react';
import { MarketplaceCredential } from '@/hooks/useDatabase';

interface WildberriesSettingsProps {
  creds: Partial<MarketplaceCredential>;
  updateField: (field: 'api_key', value: string) => void;
  onCheckConnection: () => void;
  onSave: () => void;
  loading: boolean;
  saving: boolean;
  checkingConnection: boolean;
}

const WildberriesSettings: React.FC<WildberriesSettingsProps> = ({
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
            value={creds.api_key || ''}
            onChange={(e) => updateField('api_key', e.target.value)}
            disabled={loading || saving}
          />
        </div>
        <div className="flex space-x-2">
           <Button
            className="flex-1"
            onClick={onCheckConnection}
            disabled={!creds.api_key || checkingConnection || saving || loading}
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

export default WildberriesSettings;
