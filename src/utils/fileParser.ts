
import * as XLSX from 'xlsx';
import { ImportedProduct } from '@/types/import';

export const parseCSV = (file: File): Promise<ImportedProduct[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
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
        
        resolve(products);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Ошибка чтения файла'));
    reader.readAsText(file);
  });
};

export const parseExcel = (file: File): Promise<ImportedProduct[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Берем первый лист
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Конвертируем в JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          reject(new Error('Файл должен содержать заголовки и хотя бы одну строку данных'));
          return;
        }
        
        const headers = jsonData[0] as string[];
        const products: ImportedProduct[] = [];
        
        for (let i = 1; i < jsonData.length; i++) {
          const row = jsonData[i] as any[];
          if (!row || row.length === 0) continue;
          
          const product: any = {};
          headers.forEach((header, index) => {
            let value = row[index];
            
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
                product[header] = Boolean(value);
                break;
              default:
                product[header] = value ? String(value) : '';
            }
          });
          
          if (product.title && product.price) {
            products.push(product);
          }
        }
        
        resolve(products);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Ошибка чтения Excel файла'));
    reader.readAsArrayBuffer(file);
  });
};
