
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface CategoryData {
  name: string;
  sales: number;
}

interface TrendsAnalyticsProps {
  categoryData: CategoryData[];
}

const TrendsAnalytics = ({ categoryData }: TrendsAnalyticsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Продажи по категориям</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              outerRadius={150}
              dataKey="sales"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {categoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'][index % 5]} 
                />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`₽${value}`, 'Продажи']} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default TrendsAnalytics;
