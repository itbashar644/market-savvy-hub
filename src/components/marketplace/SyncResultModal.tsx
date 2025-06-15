
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

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
  const successCount = results.filter(r => r.updated).length;
  const errorCount = results.filter(r => !r.updated).length;
  const errorResults = results.filter(r => !r.updated);

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
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h3 className="text-lg font-semibold">Товары с ошибками</h3>
              </div>
              
              <ScrollArea className="h-[400px] w-full border rounded-md p-4">
                <div className="space-y-3">
                  {errorResults.map((result, index) => (
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
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SyncResultModal;
