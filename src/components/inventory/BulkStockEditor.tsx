
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { InventoryItem } from '@/types/database';
import { useToast } from "@/components/ui/use-toast";

interface BulkStockEditorProps {
  inventory: InventoryItem[];
  onBulkUpdate: (updates: { sku: string, newStock: number }[]) => void;
  onClose: () => void;
}

interface ParsedUpdate {
  sku: string;
  newStock: number;
  productName: string;
  currentStock: number;
  status: 'found' | 'not_found' | 'invalid_stock';
}

const BulkStockEditor = ({ inventory, onBulkUpdate, onClose }: BulkStockEditorProps) => {
  const [textInput, setTextInput] = useState('');
  const [parsedUpdates, setParsedUpdates] = useState<ParsedUpdate[]>([]);
  const { toast } = useToast();

  const parseInput = () => {
    console.log('Parsing input:', textInput);
    console.log('Available inventory:', inventory.map(i => ({ sku: i.sku, name: i.name })));
    
    const lines = textInput.trim().split('\n');
    const updates: ParsedUpdate[] = lines.filter(line => line.trim() !== '').map(line => {
      const parts = line.trim().split(/[\s\t]+/);
      if (parts.length !== 2) {
        return { sku: line, newStock: 0, productName: 'Неверный формат', currentStock: 0, status: 'invalid_stock' };
      }
      
      const [sku, stockStr] = parts;
      const newStock = parseInt(stockStr, 10);
      
      if (isNaN(newStock) || newStock < 0) {
        return { sku, newStock: 0, productName: 'Неверный остаток', currentStock: 0, status: 'invalid_stock' };
      }
      
      // Ищем товар по SKU с учетом разных вариантов
      const inventoryItem = inventory.find(item => 
        item.sku === sku || 
        item.sku === sku.toString() ||
        item.productId === sku ||
        item.name.toLowerCase().includes(sku.toLowerCase())
      );
      
      console.log(`Searching for SKU: ${sku}, found:`, inventoryItem);
      
      if (inventoryItem) {
        return {
          sku,
          newStock,
          productName: inventoryItem.name,
          currentStock: inventoryItem.currentStock,
          status: 'found'
        };
      } else {
        return { sku, newStock, productName: 'Товар не найден', currentStock: 0, status: 'not_found' };
      }
    });

    const statusOrder = {
      'invalid_stock': 0,
      'not_found': 1,
      'found': 2,
    };

    updates.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
    
    setParsedUpdates(updates);
    console.log('Parsed updates:', updates);
  };
  
  const handleSave = () => {
    const validUpdates = parsedUpdates
      .filter(u => u.status === 'found')
      .map(({ sku, newStock }) => ({ sku, newStock }));

    if (validUpdates.length === 0) {
      toast({
        title: 'Нет корректных данных для обновления',
        description: 'Пожалуйста, проверьте введенные SKU и остатки.',
        variant: 'destructive',
      });
      return;
    }
    
    console.log('Sending updates:', validUpdates);
    onBulkUpdate(validUpdates);
    toast({
      title: 'Остатки успешно обновлены',
      description: `${validUpdates.length} позиций было обновлено.`,
    });
    onClose();
  };
  
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="bulk-stock-input" className="block text-sm font-medium text-gray-700 mb-1">
          Введите SKU и новый остаток (через пробел или таб), каждую позицию с новой строки.
        </label>
        <div className="mb-2 p-3 bg-blue-50 rounded-md text-sm">
          <p className="font-medium mb-1">Доступные SKU в системе:</p>
          <div className="max-h-32 overflow-y-auto text-xs">
            {inventory.slice(0, 10).map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.sku}</span>
                <span className="text-gray-500">{item.name}</span>
              </div>
            ))}
            {inventory.length > 10 && <p className="text-gray-500 mt-1">...и еще {inventory.length - 10} товаров</p>}
          </div>
        </div>
        <Textarea
          id="bulk-stock-input"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="x9.pro.pink 50&#10;Y92.blue 120&#10;Y92.pink 0"
          rows={8}
          className="font-mono text-sm"
        />
        <Button onClick={parseInput} className="mt-2">
          Проверить данные
        </Button>
      </div>

      {parsedUpdates.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2">Предварительный просмотр</h3>
          <div className="max-h-60 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">SKU</TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead className="w-20">Текущий</TableHead>
                  <TableHead className="w-20">Новый</TableHead>
                  <TableHead className="w-24">Статус</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parsedUpdates.map((update, index) => (
                  <TableRow
                    key={index}
                    className={
                      update.status === 'not_found' || update.status === 'invalid_stock'
                        ? 'bg-red-50'
                        : ''
                    }
                  >
                    <TableCell className="font-mono text-xs">{update.sku}</TableCell>
                    <TableCell className="text-xs">{update.productName}</TableCell>
                    <TableCell className="text-xs">{update.status === 'found' ? update.currentStock : '–'}</TableCell>
                    <TableCell className="text-xs">{update.status === 'found' || update.status === 'not_found' ? update.newStock : '–'}</TableCell>
                    <TableCell className="text-xs">
                      {update.status === 'found' && <span className="text-green-600">Найден</span>}
                      {update.status === 'not_found' && <span className="text-red-600">Не найден</span>}
                      {update.status === 'invalid_stock' && <span className="text-red-600">Ошибка</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 mt-4">
        <Button variant="outline" onClick={onClose}>Отмена</Button>
        <Button onClick={handleSave} disabled={parsedUpdates.filter(u => u.status === 'found').length === 0}>
          Сохранить изменения ({parsedUpdates.filter(u => u.status === 'found').length})
        </Button>
      </div>
    </div>
  );
};

export default BulkStockEditor;
