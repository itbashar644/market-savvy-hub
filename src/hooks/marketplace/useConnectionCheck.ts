
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceCredentials } from '@/hooks/useDatabase';
import { supabase } from '@/integrations/supabase/client';

export const useConnectionCheck = () => {
  const { toast } = useToast();
  const { credentials } = useMarketplaceCredentials();
  const [checkingConnection, setCheckingConnection] = useState<string | null>(null);

  const ozonCreds = credentials['Ozon'] || {};
  const wbCreds = credentials['Wildberries'] || {};

  const handleCheckConnection = async (marketplace: string) => {
    setCheckingConnection(marketplace);
    let apiKey, clientId;

    try {
      if (marketplace === 'Ozon') {
        apiKey = ozonCreds.api_key;
        clientId = ozonCreds.client_id;
        if (!apiKey || !clientId) {
          toast({
            title: "Не указаны обязательные поля",
            description: "Пожалуйста, укажите API ключ и Client ID для Ozon.",
            variant: "destructive",
          });
          setCheckingConnection(null);
          return;
        }

        const { data, error } = await supabase.functions.invoke('ozon-connection-check', {
          body: { 
            apiKey, 
            clientId
          },
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "Подключение к Ozon",
            description: data.message,
            variant: "default",
          });
        } else {
          toast({
            title: "Ошибка подключения к Ozon",
            description: data.error,
            variant: "destructive",
          });
        }
      } else if (marketplace === 'Wildberries') {
        apiKey = wbCreds.api_key;
        if (!apiKey) {
          toast({
            title: "Не указан API ключ",
            description: "Пожалуйста, укажите API ключ для Wildberries.",
            variant: "destructive",
          });
          setCheckingConnection(null);
          return;
        }

        const { data, error } = await supabase.functions.invoke('wildberries-connection-check', {
          body: { apiKey },
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "Подключение к Wildberries",
            description: data.message,
            variant: "default",
          });
        } else {
          toast({
            title: "Ошибка подключения к Wildberries",
            description: data.error,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Функционал в разработке",
          description: `Проверка подключения для ${marketplace} пока не доступна.`,
          variant: "default",
        });
      }
    } catch (error: any) {
      console.error('Error checking connection:', error);
      toast({
        title: "Ошибка проверки подключения",
        description: error.message || "Произошла неизвестная ошибка.",
        variant: "destructive"
      });
    } finally {
      setCheckingConnection(null);
    }
  };

  return {
    checkingConnection,
    handleCheckConnection
  };
};
