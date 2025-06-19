
import { toast } from 'sonner';

export const useDatabase = () => {
  const initializeDatabase = () => {
    console.log('🚀 База данных Supabase готова к использованию');
    toast.success('База данных инициализирована');
  };

  return {
    initializeDatabase,
  };
};
