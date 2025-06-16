
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SyncResult {
  offer_id: string;
  updated: boolean;
  errors?: Array<{
    code: string;
    message: string;
  }>;
}

interface SyncResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketplace: string;
  results: SyncResult[];
}

const SyncResultModal: React.FC<SyncResultModalProps> = ({
  isOpen,
  onClose,
  marketplace,
  results
}) => {
  const { toast } = useToast();
  const successCount = results.filter(r => r.updated).length;
  const errorCount = results.filter(r => !r.updated).length;
  const errorResults = results.filter(r => !r.updated);

  const copyErrorDetails = () => {
    const errorText = errorResults.map(result => 
      `SKU: ${result.offer_id}\nОшибки: ${result.errors?.map(e => `${e.code}: ${e.message}`).join('; ') || 'Неизвестная ошибка'}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(errorText);
    toast({
      title: "Скопировано",
      description: "Детали ошибок скопированы в буфер обмена",
    });
  };

  // Группируем ошибки по типам для лучшего анализа
  const errorsByType = errorResults.reduce((acc, result) => {
    const errorCode = result.errors?.[0]?.code || 'UNKNOWN';
    if (!acc[errorCode]) {
      acc[errorCode] = [];
    }
    acc[errorCode].push(result);
    return acc;
  }, {} as Record<string, SyncResult[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Результаты синхронизации с {marketplace}</DialogTitle>
          <DialogDescription>
            Детальные результаты обновления товаров
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium">Успешно: {successCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium">Ошибки: {errorCount}</span>
            </div>
          </div>

          {errorCount > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <h3 className="text-lg font-semibold">Анализ ошибок</h3>
                </div>
                <Button variant="outline" size="sm" onClick={copyErrorDetails}>
                  <Copy className="w-4 h-4 mr-2" />
                  Копировать детали
                </Button>
              </div>

              {/* Краткая сводка по типам ошибок */}
              <div className="grid gap-2">
                {Object.entries(errorsByType).map(([errorCode, items]) => (
                  <div key={errorCode} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="font-medium text-sm">{errorCode}</span>
                    <Badge variant="destructive">{items.length} товаров</Badge>
                  </div>
                ))}
              </div>

              {/* Рекомендации по устранению */}
              {errorsByType['CONFLICT_ERROR'] && (
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r">
                  <h4 className="font-semibold text-yellow-800">Рекомендации по устранению конфликтов:</h4>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• Проверьте, что все SKU существуют в личном кабинете Wildberries</li>
                    <li>• Убедитесь, что ID склада (7963) правильный</li>
                    <li>• Проверьте права API ключа на обновление остатков</li>
                    <li>• Некоторые SKU могут быть заблокированы или удалены</li>
                  </ul>
                </div>
              )}
              
              <ScrollArea className="h-[300px] w-full border rounded-md p-4">
                <div className="space-y-3">
                  {errorResults.slice(0, 50).map((result, index) => (
                    <div key={index} className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 rounded-r">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{result.offer_id}</span>
                        <Badge variant="destructive">Ошибка</Badge>
                      </div>
                      {result.errors && result.errors.length > 0 && (
                        <div className="space-y-1">
                          {result.errors.map((error, errorIndex) => (
                            <div key={errorIndex} className="text-sm text-gray-700">
                              <span className="font-medium">{error.code}:</span> {error.message}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {errorResults.length > 50 && (
                    <div className="text-center text-gray-500 text-sm">
                      ... и ещё {errorResults.length - 50} ошибок
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>Закрыть</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyncResultModal;
