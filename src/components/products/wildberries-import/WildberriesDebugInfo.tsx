
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { WildberriesStockItem } from '@/hooks/database/useWildberriesStock';

interface WildberriesDebugInfoProps {
  stockItems: WildberriesStockItem[];
}

export const WildberriesDebugInfo: React.FC<WildberriesDebugInfoProps> = ({ stockItems }) => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg">
      <h4 className="font-medium text-blue-800 mb-2 flex items-center space-x-2">
        <AlertTriangle className="w-4 h-4" />
        <span>Остатки WB в базе данных (первые 20 из {stockItems.length}):</span>
      </h4>
      <div className="text-sm text-blue-700 space-y-1 max-h-60 overflow-y-auto">
        {stockItems.slice(0, 20).map((item, index) => (
          <div key={index} className="font-mono text-xs p-2 bg-white rounded border">
            <div><strong>#{index + 1}</strong></div>
            <div><strong>Internal SKU:</strong> {item.internal_sku}</div>
            <div><strong>WB SKU:</strong> <span className="text-green-600">{item.wildberries_sku}</span></div>
            <div><strong>Остаток:</strong> <span className={item.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>{item.stock_quantity}</span></div>
            <div><strong>Обновлен:</strong> {new Date(item.last_updated).toLocaleString('ru-RU')}</div>
          </div>
        ))}
        {stockItems.length > 20 && (
          <div className="text-blue-600 text-center pt-2">
            <strong>... и ещё {stockItems.length - 20} остатков</strong>
          </div>
        )}
        <div className="mt-4 pt-2 border-t border-blue-200 bg-blue-100 p-2 rounded">
          <strong>Всего остатков WB: {stockItems.length}</strong>
        </div>
      </div>
    </div>
  );
};
