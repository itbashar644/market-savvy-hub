
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Mail, Phone, Edit, Users } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
  registrationDate: string;
  lastOrderDate: string;
}

const CustomersManager = () => {
  const [customers] = useState<Customer[]>([
    {
      id: '1',
      name: 'Анна Петрова',
      email: 'anna@example.com',
      phone: '+7 (999) 123-45-67',
      totalOrders: 5,
      totalSpent: 125000,
      status: 'active',
      registrationDate: '2023-12-01',
      lastOrderDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Михаил Сидоров',
      email: 'mikhail@example.com',
      phone: '+7 (999) 234-56-78',
      totalOrders: 3,
      totalSpent: 85000,
      status: 'active',
      registrationDate: '2023-11-15',
      lastOrderDate: '2024-01-14'
    },
    {
      id: '3',
      name: 'Елена Козлова',
      email: 'elena@example.com',
      phone: '+7 (999) 345-67-89',
      totalOrders: 8,
      totalSpent: 200000,
      status: 'active',
      registrationDate: '2023-10-20',
      lastOrderDate: '2024-01-13'
    },
    {
      id: '4',
      name: 'Дмитрий Волков',
      email: 'dmitry@example.com',
      phone: '+7 (999) 456-78-90',
      totalOrders: 1,
      totalSpent: 15000,
      status: 'inactive',
      registrationDate: '2023-09-10',
      lastOrderDate: '2023-12-01'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  const avgOrderValue = customers.reduce((sum, customer) => sum + customer.totalOrders, 0) / customers.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Управление клиентами</h1>
          <p className="text-gray-600 mt-1">Просматривайте и управляйте базой клиентов</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Добавить клиента
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Всего клиентов</p>
                <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Активные</p>
                <p className="text-2xl font-bold text-gray-900">{activeCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Общий доход</p>
                <p className="text-2xl font-bold text-gray-900">₽{totalRevenue.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ср. заказов</p>
                <p className="text-2xl font-bold text-gray-900">{avgOrderValue.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>База клиентов</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Поиск по имени, email или телефону..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Клиент</TableHead>
                <TableHead>Контакты</TableHead>
                <TableHead>Заказов</TableHead>
                <TableHead>Потрачено</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Последний заказ</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-gray-500">Регистрация: {customer.registrationDate}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center text-sm">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {customer.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{customer.totalOrders}</TableCell>
                  <TableCell>₽{customer.totalSpent.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={customer.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                    }>
                      {customer.status === 'active' ? 'Активный' : 'Неактивный'}
                    </Badge>
                  </TableCell>
                  <TableCell>{customer.lastOrderDate}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersManager;
