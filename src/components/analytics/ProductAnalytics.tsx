
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  image: string;
  revenue: number;
}

interface ProductAnalyticsProps {
  topProductsByRevenue: Product[];
}

const ProductAnalytics = ({ topProductsByRevenue }: ProductAnalyticsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Топ товаров по выручке</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Товар</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Цена</TableHead>
              <TableHead>Выручка</TableHead>
              <TableHead>Остаток</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProductsByRevenue.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-10 h-10 rounded object-cover" 
                    />
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sku}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>₽{product.price.toLocaleString()}</TableCell>
                <TableCell>₽{product.revenue.toLocaleString()}</TableCell>
                <TableCell>{product.stock} шт</TableCell>
                <TableCell>
                  <Badge 
                    className={
                      product.status === 'active' ? 'bg-green-100 text-green-800' :
                      product.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {product.status === 'active' ? 'Активен' :
                     product.status === 'low_stock' ? 'Мало' :
                     'Нет в наличии'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ProductAnalytics;
