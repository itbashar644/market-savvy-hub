
import React from 'react';
import { Badge } from '@/components/ui/badge';

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Чат с клиентами</h1>
        <p className="text-gray-600 mt-1">Онлайн поддержка и консультации</p>
      </div>
      <Badge className="bg-green-100 text-green-800">
        0 онлайн
      </Badge>
    </div>
  );
};

export default ChatHeader;
