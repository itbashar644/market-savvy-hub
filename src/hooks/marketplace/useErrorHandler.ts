
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useErrorHandler = () => {
  const { toast } = useToast();
  const [lastError, setLastError] = useState<string>('');
  const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout | null>(null);

  // Функция для отображения стойких ошибок
  const showPersistentError = (title: string, description: string) => {
    setLastError(description);
    
    // Очищаем предыдущий таймаут
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    
    // Показываем тост с длительным временем отображения
    toast({
      title,
      description,
      variant: "destructive",
      duration: 20000, // 20 секунд
    });
    
    // Устанавливаем новый таймаут для очистки ошибки (1 минута)
    const newTimeout = setTimeout(() => {
      setLastError('');
    }, 60000);
    
    setErrorTimeout(newTimeout);
  };

  // Очищаем таймаут при размонтировании компонента
  useEffect(() => {
    return () => {
      if (errorTimeout) {
        clearTimeout(errorTimeout);
      }
    };
  }, [errorTimeout]);

  const clearError = () => {
    setLastError('');
    if (errorTimeout) {
      clearTimeout(errorTimeout);
      setErrorTimeout(null);
    }
  };

  return {
    lastError,
    showPersistentError,
    clearError
  };
};
