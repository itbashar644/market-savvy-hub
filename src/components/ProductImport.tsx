
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Check, X, Download } from 'lucide-react';
import { useProducts } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';

interface ImportedProduct {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  imageUrl: string;
  rating?: number;
  inStock: boolean;
  colors?: string;
  sizes?: string;
  countryOfOrigin?: string;
  isNew?: boolean;
  isBestseller?: boolean;
  articleNumber: string;
  barcode?: string;
  wildberriesUrl?: string;
  ozonUrl?: string;
  avitoUrl?: string;
  stockQuantity: number;
}

const ProductImport = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<ImportedProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const { addProduct } = useProducts();
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setCsvFile(file);
      parseCSV(file);
    } else {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите CSV файл",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (file: File) => {
    setIsProcessing(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const products: ImportedProduct[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',');
        if (values.length < headers.length) continue;
        
        const product: any = {};
        headers.forEach((header, index) => {
          let value = values[index]?.trim().replace(/"/g, '');
          
          // Преобразование типов данных
          switch (header) {
            case 'price':
            case 'discountPrice':
            case 'rating':
            case 'stockQuantity':
              product[header] = value ? parseFloat(value) : undefined;
              break;
            case 'inStock':
            case 'isNew':
            case 'isBestseller':
              product[header] = value?.toLowerCase() === 'true';
              break;
            default:
              product[header] = value;
          }
        });
        
        if (product.title && product.price) {
          products.push(product);
        }
      }
      
      setImportedData(products);
      setIsProcessing(false);
      
      toast({
        title: "Файл обработан",
        description: `Найдено ${products.length} товаров для импорта`,
      });
    };
    
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setIsProcessing(true);
    let successCount = 0;
    let errorCount = 0;

    for (const item of importedData) {
      try {
        // Определяем правильный статус товара
        let productStatus: 'active' | 'low_stock' | 'out_of_stock' = 'active';
        if (!item.inStock || item.stockQuantity === 0) {
          productStatus = 'out_of_stock';
        } else if (item.stockQuantity < 10) {
          productStatus = 'low_stock';
        }

        // Маппинг данных в формат CRM
        const productData = {
          name: item.title,
          sku: item.articleNumber || item.id,
          category: item.category,
          price: item.discountPrice || item.price,
          description: item.description,
          image: item.imageUrl || '/placeholder.svg',
          status: productStatus,
          stock: item.stockQuantity || 0,
          minStock: 5,
          maxStock: 100,
          supplier: item.countryOfOrigin || 'Не указано',
          ozonSynced: !!item.ozonUrl,
          wbSynced: !!item.wildberriesUrl,
        };

        await addProduct(productData);
        successCount++;
      } catch (error) {
        console.error('Ошибка импорта товара:', error);
        errorCount++;
      }
    }

    setIsProcessing(false);
    
    toast({
      title: "Импорт завершен",
      description: `Успешно: ${successCount}, Ошибок: ${errorCount}`,
    });

    if (successCount > 0) {
      setImportedData([]);
      setCsvFile(null);
      setPreviewMode(true);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'id', 'title', 'description', 'price', 'discountPrice', 'category',
      'imageUrl', 'rating', 'inStock', 'colors', 'sizes', 'countryOfOrigin',
      'isNew', 'isBestseller', 'articleNumber', 'barcode', 'wildberriesUrl',
      'ozonUrl', 'avitoUrl', 'stockQuantity'
    ];
    
    const csvContent = headers.join(',') + '\n';
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="w-5 h-5" />
            <span>Импорт товаров из CSV</span>
          </CardTitle>
          <CardDescription>
            Загрузите CSV файл с товарами для массового импорта в систему
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={downloadTemplate}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Скачать шаблон</span>
            </Button>
            
            <div className="flex-1">
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
            </div>
          </div>

          {csvFile && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
              <span className="text-green-800">Файл загружен: {csvFile.name}</span>
              <Badge variant="outline">{importedData.length} товаров</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {importedData.length > 0 && (
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setImportedData([]);
                      setCsvFile(null);
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Отменить
                  </Button>
                  <Button
                    onClick={handleImport}
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
      )}
    </div>
  );
};

export default ProductImport;
