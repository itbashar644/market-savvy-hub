
import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Download } from 'lucide-react';

interface AnalyticsHeaderProps {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
}

const AnalyticsHeader = ({ selectedPeriod, setSelectedPeriod }: AnalyticsHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Аналитика продаж</h1>
        <p className="text-gray-600 mt-1">Детальная аналитика эффективности бизнеса</p>
      </div>
      <div className="flex gap-2">
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">За неделю</SelectItem>
            <SelectItem value="month">За месяц</SelectItem>
            <SelectItem value="year">За год</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Фильтры
        </Button>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="w-4 h-4 mr-2" />
          Экспорт
        </Button>
      </div>
    </div>
  );
};

export default AnalyticsHeader;
