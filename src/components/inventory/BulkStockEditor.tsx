
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
      
      const inventoryItem = inventory.find(item => item.sku === sku);
      
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
        <Textarea
          id="bulk-stock-input"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="SKU001 50&#10;SKU002 120&#10;SKU003 0"
          rows={10}
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
                  <TableHead>SKU</TableHead>
                  <TableHead>Товар</TableHead>
                  <TableHead>Текущий остаток</TableHead>
                  <TableHead>Новый остаток</TableHead>
                  <TableHead>Статус</TableHead>
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
                    <TableCell>{update.sku}</TableCell>
                    <TableCell>{update.productName}</TableCell>
                    <TableCell>{update.status === 'found' ? update.currentStock : '–'}</TableCell>
                    <TableCell>{update.status === 'found' || update.status === 'not_found' ? update.newStock : '–'}</TableCell>
                    <TableCell>
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
          Сохранить изменения
        </Button>
      </div>
    </div>
  );
};

export default BulkStockEditor;

