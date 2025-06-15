import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";

const AuthPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('login'); // 'login', 'signup', or 'forgot_password'

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({
        title: "Ошибка входа",
        description: error.message,
        variant: "destructive",
      });
    } else {
       toast({
        title: "Вход выполнен",
        description: "Вы успешно вошли в систему.",
      });
    }
    setLoading(false);
  };
  
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Пароли не совпадают",
        description: "Пожалуйста, убедитесь, что вы ввели одинаковые пароли.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Ошибка регистрации",
        description: error.message,
        variant: "destructive",
      });
    } else if (data.user && data.user.identities && data.user.identities.length === 0) {
      toast({
        title: "Ошибка",
        description: "Пользователь с таким email уже существует.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Регистрация почти завершена",
        description: "Мы отправили вам письмо для подтверждения электронной почты.",
      });
      setView('login');
    }
  };
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setLoading(false);
    if (error) {
      toast({
        title: "Ошибка",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Проверьте почту",
        description: "Мы отправили ссылку для сброса пароля на ваш email.",
      });
      setView('login');
    }
  };

  if (view === 'signup') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Регистрация</CardTitle>
            <CardDescription>Создайте новый аккаунт, чтобы начать работу.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Пароль</Label>
                <Input id="password-signup" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password-signup">Подтвердите пароль</Label>
                <Input id="confirm-password-signup" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
              </Button>
            </form>
            <Button variant="link" className="w-full mt-2 px-0" onClick={() => { setView('login'); setPassword(''); setConfirmPassword(''); }}>
              Уже есть аккаунт? Войти
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (view === 'forgot_password') {
    return (
       <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Сброс пароля</CardTitle>
            <CardDescription>Введите ваш email, чтобы получить ссылку для сброса пароля.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-reset">Email</Label>
                <Input id="email-reset" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Отправка...' : 'Отправить ссылку'}
              </Button>
            </form>
            <Button variant="link" className="w-full mt-2 px-0" onClick={() => setView('login')}>
              Вернуться ко входу
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Вход в CRM Store</CardTitle>
          <CardDescription>Введите свои данные для входа.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email-login">Email</Label>
              <Input id="email-login" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-login">Пароль</Label>
              <Input id="password-login" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
             <div className="flex justify-end">
                <Button variant="link" className="p-0 h-auto text-sm" onClick={() => { setView('forgot_password'); setPassword(''); }}>
                    Забыли пароль?
                </Button>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Вход...' : 'Войти'}
            </Button>
          </form>
           <Button variant="link" className="w-full mt-2 px-0" onClick={() => { setView('signup'); setPassword(''); }}>
              Нет аккаунта? Зарегистрироваться
            </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
