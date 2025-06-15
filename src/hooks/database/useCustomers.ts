
import { useState, useEffect } from 'react';
import { db } from '@/lib/database';
import { Customer } from '@/types/database';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCustomers = () => {
    setCustomers(db.getCustomers());
    setLoading(false);
  };

  useEffect(() => {
    refreshCustomers();
  }, []);

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer = db.addCustomer(customer);
    refreshCustomers();
    return newCustomer;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    const updated = db.updateCustomer(id, updates);
    refreshCustomers();
    return updated;
  };

  const deleteCustomer = (id: string) => {
    const success = db.deleteCustomer(id);
    refreshCustomers();
    return success;
  };

  return {
    customers,
    loading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    refreshCustomers,
  };
};
