
import React from 'react';
import { Card } from '@/components/ui/card';
import EmptyState from './EmptyState';

const ChatWindow = () => {
  return (
    <Card className="lg:col-span-2 flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <EmptyState
          title="Выберите чат"
          description="Выберите чат для начала общения"
        />
      </div>
    </Card>
  );
};

export default ChatWindow;
