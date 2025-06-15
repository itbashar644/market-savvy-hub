
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import EmptyState from './EmptyState';

interface ChatListProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const ChatList = ({ searchTerm, onSearchChange }: ChatListProps) => {
  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Поиск чатов..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex-1 flex items-center justify-center h-[480px]">
          <EmptyState
            title="Нет чатов"
            description="Чаты с клиентами будут отображаться здесь"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ChatList;
