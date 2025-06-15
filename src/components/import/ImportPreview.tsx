
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { ImportedProduct } from '@/types/import';

interface ImportPreviewProps {
  importedData: ImportedProduct[];
  isProcessing: boolean;
  onImport: () => void;
  onCancel: () => void;
}

const ImportPreview = ({ importedData, isProcessing, onImport, onCancel }: ImportPreviewProps) => {
  if (importedData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Предварительный просмотр импорта</CardTitle>
        <CardDescription>
          Проверьте данные перед импортом в систему
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="max-h-96 overflow-y-auto">
            <div className="grid gap-3">
              {importedData.slice(0, 10).map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <img
                      src={product.imageUrl || '/placeholder.svg'}
                      alt={product.title}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div>
                      <h4 className="font-medium">{product.title}</h4>
                      <p className="text-sm text-gray-600">
                        {product.category} • {product.price} ₽
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {product.inStock ? 'В наличии' : 'Нет в наличии'}
                    </Badge>
                    {product.ozonUrl && <Badge variant="outline">Ozon</Badge>}
                    {product.wildberriesUrl && <Badge variant="outline">WB</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {importedData.length > 10 && (
            <p className="text-sm text-gray-600 text-center">
              ... и еще {importedData.length - 10} товаров
            </p>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="text-sm text-gray-600">
              Всего товаров к импорту: <strong>{importedData.length}</strong>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onCancel}>
                <X className="w-4 h-4 mr-2" />
                Отменить
              </Button>
              <Button
                onClick={onImport}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                {isProcessing ? 'Импортируем...' : 'Импортировать'}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImportPreview;
