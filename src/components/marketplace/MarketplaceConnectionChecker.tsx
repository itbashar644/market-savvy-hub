
import { toast } from "sonner";

export class MarketplaceConnectionChecker {
  static async checkConnection(marketplace: string): Promise<void> {
    try {
      const endpoint = marketplace === 'Ozon' 
        ? '/functions/v1/ozon-connection-check'
        : '/functions/v1/wildberries-connection-check';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
