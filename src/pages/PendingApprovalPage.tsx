
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const PendingApprovalPage = () => {
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/auth'; // Перенаправляем на страницу входа
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[450px] text-center">
        <CardHeader>
          <CardTitle>Ожидание подтверждения</CardTitle>
          <CardDescription>Ваша учетная запись ожидает одобрения администратором.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-6">
            Как только ваша учетная запись будет активирована, вы получите доступ к системе.
            Спасибо за ваше терпение.
          </p>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PendingApprovalPage;
