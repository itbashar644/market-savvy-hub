
import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './chat/ChatHeader';
import ChatList from './chat/ChatList';
import ChatWindow from './chat/ChatWindow';

const ChatWidget = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chats: any[] = [];
  const messages: any[] = [];

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedChatData = chats.find(chat => chat.id === selectedChat);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log('Отправка сообщения:', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="p-6">
      <ChatHeader />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        <ChatList
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
        />
        <ChatWindow />
      </div>
    </div>
  );
};

export default ChatWidget;
