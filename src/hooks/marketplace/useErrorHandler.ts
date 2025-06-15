
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useErrorHandler = () => {
  const { toast } = useToast();
  const [lastError, setLastError] = useState<string>('');
  const [errorTimeout, setErrorTimeout] = useState<NodeJS.Timeout | null>(null);

  // Функция для отображения ошибок с автоскрытием
  const showPersistentError = (title: string, description: string) => {
    setLastError(description);
    
    // Очищаем предыдущий таймаут
    if (errorTimeout) {
      clearTimeout(errorTimeout);
    }
    
    toast({
      title,
      description,
      variant: "destructive",
      duration: 15000, // Увеличиваем до 15 секунд
    });
    
    // Устанавливаем новый таймаут для очистки ошибки
    const newTimeout = setTimeout(() => {
      setLastError('');
    }, 30000); // Очищаем через 30 секунд
    
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
