
import React, { useState } from 'react';
import { useProducts } from '@/hooks/useDatabase';
import { useToast } from '@/hooks/use-toast';
import { ImportedProduct, FileType } from '@/types/import';
import { parseCSV, parseExcel } from '@/utils/fileParser';
import FileUploadSection from '@/components/import/FileUploadSection';
import ImportPreview from '@/components/import/ImportPreview';

const ProductImport = () => {
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importedData, setImportedData] = useState<ImportedProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileType, setFileType] = useState<FileType>(null);
  const { addProduct } = useProducts();
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExtension === 'csv') {
      setImportFile(file);
      setFileType('csv');
      await processFile(file, 'csv');
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      setImportFile(file);
      setFileType('xlsx');
      await processFile(file, 'xlsx');
    } else {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, выберите CSV или Excel (xlsx) файл",
        variant: "destructive",
      });
    }
  };

  const processFile = async (file: File, type: 'csv' | 'xlsx') => {
    setIsProcessing(true);
    
    try {
      let products: ImportedProduct[];
      
      if (type === 'csv') {
        products = await parseCSV(file);
      } else {
        products = await parseExcel(file);
      }
      
      setImportedData(products);
      
      toast({
        title: `${type === 'csv' ? 'CSV' : 'Excel'} файл обработан`,
        description: `Найдено ${products.length} товаров для импорта`,
      });
    } catch (error) {
      console.error('Ошибка обработки файла:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось обработать файл",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
      handleCancel();
    }
  };

  const handleCancel = () => {
    setImportedData([]);
    setImportFile(null);
    setFileType(null);
  };

  return (
    <div className="space-y-6">
      <FileUploadSection
        importFile={importFile}
        fileType={fileType}
        importedDataLength={importedData.length}
        onFileUpload={handleFileUpload}
      />

      <ImportPreview
        importedData={importedData}
        isProcessing={isProcessing}
        onImport={handleImport}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default ProductImport;
