
import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const SettingsManager = () => {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Настройки</h1>
        <p className="text-gray-600 mt-1">Управление настройками профиля, магазина и уведомлений</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="store">Магазин</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="appearance">Внешний вид</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Профиль</CardTitle>
              <CardDescription>Управление информацией вашего профиля.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Имя</Label>
                <Input id="name" defaultValue="Текущий Пользователь" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="user@example.com" readOnly />
              </div>
              <Button>Сохранить изменения</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="store" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Магазин</CardTitle>
              <CardDescription>Настройки вашего магазина.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                <Label htmlFor="store-name">Название магазина</Label>
                <Input id="store-name" defaultValue="CRM Store" />
              </div>
              <Button>Сохранить настройки</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Уведомления</CardTitle>
              <CardDescription>Настройте, как вы будете получать уведомления.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border">
                <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                  <span>Email уведомления</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Получать уведомления о новых заказах по email.
                  </span>
                </Label>
                <Switch id="email-notifications" defaultChecked />
              </div>
               <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border">
                <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                  <span>Push уведомления</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Получать push-уведомления в браузере.
                  </span>
                </Label>
                <Switch id="push-notifications" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Внешний вид</CardTitle>
              <CardDescription>Настройте внешний вид приложения.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="flex items-center justify-between space-x-2 p-4 rounded-lg border">
                <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                  <span>Темная тема</span>
                  <span className="font-normal leading-snug text-muted-foreground">
                    Включить темную тему оформления.
                  </span>
                </Label>
                <Switch id="dark-mode" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsManager;
