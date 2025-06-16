
import { toast } from "sonner";

export class MarketplaceConnectionChecker {
  static async checkConnection(marketplace: string): Promise<void> {
    try {
      // Используем правильные пути для Supabase Edge Functions
      const endpoint = marketplace === 'Ozon' 
        ? 'https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/ozon-connection-check'
        : 'https://lpwvhyawvxibtuxfhitx.supabase.co/functions/v1/wildberries-connection-check';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
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
