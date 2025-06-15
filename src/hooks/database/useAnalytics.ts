
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { SalesData, CategoryData } from '@/types/database';

export const useAnalytics = () => {
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAnalytics = (period: 'week' | 'month' | 'year' = 'month') => {
    setSalesData(db.getSalesData(period));
    setCategoryData(db.getCategoryData());
    setLoading(false);
  };

  useEffect(() => {
    refreshAnalytics();
  }, []);

  return {
    salesData,
    categoryData,
    loading,
    refreshAnalytics,
  };
};
