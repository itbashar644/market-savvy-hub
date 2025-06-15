
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Phone, 
  Video, 
  MoreVertical, 
  Search,
  Paperclip,
  Smile
} from 'lucide-react';

const ChatWidget = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chats = [
    {
      id: 1,
      name: 'Анна Петрова',
      lastMessage: 'Когда будет доставка?',
      timestamp: '14:30',
      unread: 2,
      online: true,
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612d26f?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 2,
      name: 'Игорь Сидоров',
      lastMessage: 'Спасибо за помощь!',
      timestamp: '13:45',
      unread: 0,
      online: false,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 3,
      name: 'Елена Козлова',
      lastMessage: 'Можно изменить заказ?',
      timestamp: '12:20',
      unread: 1,
      online: true,
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face'
    },
    {
      id: 4,
      name: 'Дмитрий Волков',
      lastMessage: 'Товар отличный!',
      timestamp: 'Вчера',
      unread: 0,
      online: false,
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    }
  ];

  const messages = [
    {
      id: 1,
      senderId: 1,
      text: 'Здравствуйте! Я заказала iPhone 15, когда будет доставка?',
      timestamp: '14:25',
      isOwn: false
    },
    {
      id: 2,
      senderId: 'support',
      text: 'Добрый день! Ваш заказ уже обрабатывается. Доставка запланирована на завтра с 10:00 до 18:00.',
      timestamp: '14:26',
      isOwn: true
    },
    {
      id: 3,
      senderId: 1,
      text: 'Отлично! А можно ли уточнить более точное время?',
      timestamp: '14:28',
      isOwn: false
    },
    {
      id: 4,
      senderId: 'support',
      text: 'Конечно! Курьер свяжется с вами за час до доставки и уточнит удобное время.',
      timestamp: '14:29',
      isOwn: true
    },
    {
      id: 5,
      senderId: 1,
      text: 'Когда будет доставка?',
      timestamp: '14:30',
      isOwn: false
    }
  ];

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Чат с клиентами</h1>
          <p className="text-gray-600 mt-1">Онлайн поддержка и консультации</p>
        </div>
        <Badge className="bg-green-100 text-green-800">
          {chats.filter(chat => chat.online).length} онлайн
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Поиск чатов..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[480px] overflow-y-auto">
              {filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                    selectedChat === chat.id 
                      ? 'bg-blue-50 border-l-blue-600' 
                      : 'border-l-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={chat.avatar}
                        alt={chat.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {chat.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chat.name}
                        </p>
                        <p className="text-xs text-gray-500">{chat.timestamp}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">
                          {chat.lastMessage}
                        </p>
                        {chat.unread > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            {chat.unread}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Window */}
        <Card className="lg:col-span-2 flex flex-col">
          {selectedChatData ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={selectedChatData.avatar}
                        alt={selectedChatData.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      {selectedChatData.online && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{selectedChatData.name}</CardTitle>
                      <CardDescription>
                        {selectedChatData.online ? 'В сети' : 'Был(а) в сети недавно'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 p-4 overflow-y-auto">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isOwn
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${
                          message.isOwn ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="outline">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Input
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500">Выберите чат для начала общения</p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatWidget;
