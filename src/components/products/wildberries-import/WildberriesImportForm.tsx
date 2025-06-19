
import React from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search } from 'lucide-react';

interface WildberriesImportFormProps {
  skuData: string;
  setSkuData: (data: string) => void;
  isProcessing: boolean;
  loading: boolean;
  stockItemsCount: number;
  showDebugInfo: boolean;
  onToggleDebugInfo: () => void;
  onProcessSkuMapping: () => void;
}

export const WildberriesImportForm: React.FC<WildberriesImportFormProps> = ({
  skuData,
  setSkuData,
  isProcessing,
  loading,
  stockItemsCount,
  showDebugInfo,
  onToggleDebugInfo,
  onProcessSkuMapping
}) => {
  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button 
          variant="outline"
          onClick={onToggleDebugInfo}
          className="flex items-center space-x-1"
        >
          <Search className="w-4 h-4" />
          <span>Показать остатки WB ({stockItemsCount})</span>
        </Button>
        
        <Button 
          onClick={onProcessSkuMapping}
          disabled={isProcessing || !skuData.trim() || loading}
          className="flex-1"
        >
          {isProcessing ? 'Импорт с остатками...' : loading ? 'Загрузка...' : 'Импортировать SKU + Остатки WB'}
        </Button>
      </div>

      <Textarea
        value={skuData}
        onChange={(e) => setSkuData(e.target.value)}
        placeholder="внутренний_sku [TAB] wb_sku&#10;..."
        className="min-h-[200px] font-mono text-sm"
      />
    </div>
  );
};
