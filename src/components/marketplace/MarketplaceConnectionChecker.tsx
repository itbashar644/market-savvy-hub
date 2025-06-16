
import { toast } from "sonner";

export class MarketplaceConnectionChecker {
  static async checkConnection(marketplace: string, apiKey?: string): Promise<void> {
    try {
      console.log(`=== Starting ${marketplace} connection check ===`);
      console.log('API key provided:', apiKey ? 'YES' : 'NO');
      
      if (!apiKey) {
        toast.error(`❌ Ошибка проверки ${marketplace}`, {
          description: 'API ключ не найден. Сначала сохраните настройки.'
        });
        return;
      }

      // Используем правильные пути для Supabase Edge Functions
      const endpoint = marketplace === 'Ozon' 
        ? 'https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/ozon-connection-check'
        : 'https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/wildberries-connection-check';

      console.log('Making request to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'apikey': `${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          marketplace: marketplace,
          apiKey: apiKey
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`HTTP error! status: ${response.status}, response: ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Response result:', result);
      
      if (result.success) {
        toast.success(`✅ Подключение к ${marketplace} успешно!`, {
          description: result.message || 'API ключ действителен'
        });
      } else {
        toast.error(`❌ Ошибка подключения к ${marketplace}`, {
          description: result.error || 'Неизвестная ошибка'
        });
      }
    } catch (error) {
      console.error(`Error checking ${marketplace} connection:`, error);
      toast.error(`❌ Ошибка подключения к ${marketplace}`, {
        description: error instanceof Error ? error.message : 'Неизвестная ошибка'
      });
    }
  }
}
