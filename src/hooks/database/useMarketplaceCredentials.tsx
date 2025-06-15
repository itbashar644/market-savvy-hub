
import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';
import { useToast } from '../use-toast';

export interface MarketplaceCredential {
  id?: number;
  user_id?: string;
  marketplace: string;
  api_key?: string | null;
  client_id?: string | null;
  warehouse_id?: string | null;
}

interface MarketplaceCredentialsContextValue {
  credentials: Record<string, Partial<MarketplaceCredential>>;
  loading: boolean;
  saving: boolean;
  updateCredentialField: (marketplace: string, field: keyof Omit<MarketplaceCredential, 'id' | 'user_id' | 'created_at' | 'updated_at'>, value: string) => void;
  saveCredentials: (marketplace: string) => Promise<void>;
}

const MarketplaceCredentialsContext = createContext<MarketplaceCredentialsContextValue | undefined>(undefined);

export const MarketplaceCredentialsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Record<string, Partial<MarketplaceCredential>>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const fetchCredentials = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_credentials')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const credsMap = data.reduce((acc, cred) => {
        acc[cred.marketplace] = cred;
        return acc;
      }, {} as Record<string, MarketplaceCredential>);

      setCredentials(credsMap);
    } catch (error: any) {
      toast({
        title: 'Ошибка загрузки ключей API',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  }, [user, toast]);

  useEffect(() => {
    if (user) {
      if (!initialized) {
        fetchCredentials();
      } else {
        setLoading(false);
      }
    } else {
      setCredentials({});
      setLoading(false);
      setInitialized(false);
    }
  }, [user, initialized, fetchCredentials]);

  const updateCredentialField = (marketplace: string, field: keyof Omit<MarketplaceCredential, 'id' | 'user_id' | 'created_at' | 'updated_at'>, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [marketplace]: {
        ...prev[marketplace],
        marketplace,
        [field]: value,
      },
    }));
  };

  const saveCredentials = async (marketplace: string) => {
    if (!user) {
      toast({ title: 'Ошибка', description: 'Пользователь не авторизован.', variant: 'destructive' });
      return;
    }

    const credToSave = credentials[marketplace];
    if (!credToSave) {
      toast({ title: 'Ошибка', description: 'Нет данных для сохранения.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('marketplace_credentials')
        .upsert({
          user_id: user.id,
          marketplace: credToSave.marketplace,
          api_key: credToSave.api_key,
          client_id: credToSave.client_id,
          warehouse_id: credToSave.warehouse_id,
        }, { onConflict: 'user_id, marketplace' })
        .select()
        .single();
      
      if (error) throw error;

      setCredentials(prev => ({ ...prev, [marketplace]: data }));
      toast({
        title: 'Успешно!',
        description: `Настройки для ${marketplace} сохранены.`,
      });
    } catch (error: any) {
      toast({
        title: 'Ошибка сохранения настроек',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  const value = {
    credentials,
    loading,
    saving,
    updateCredentialField,
    saveCredentials,
  };

  return (
    <MarketplaceCredentialsContext.Provider value={value}>
      {children}
    </MarketplaceCredentialsContext.Provider>
  );
};

export const useMarketplaceCredentials = () => {
  const context = useContext(MarketplaceCredentialsContext);
  if (context === undefined) {
    throw new Error('useMarketplaceCredentials must be used within a MarketplaceCredentialsProvider');
  }
  return context;
};
