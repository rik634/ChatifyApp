import React, { useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import { type ChatRoom, ChatRoomType } from '../types/room.types';
import { type User } from '../types/auth.types';
import { type Message } from '../types/message.types';
import { roomApi } from '../api/room.api';
import { ChatWindow } from '../components/chat/ChatWindow';
import { CreateRoomModal } from '../components/modals/CreateRoomModal';
import { LogOut, MessageSquare } from 'lucide-react';
import { useWebSocket } from '../hooks/useWebsocket';
import { ChatSidebar } from '../components/chat/ChatSideBar';

export const Chat: React.FC = () => {
  const { user, token, logout } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [newMessage, setNewMessage] = useState<Message | undefined>();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const [createRoomType, setCreateRoomType] = useState<ChatRoomType>(ChatRoomType.CHANNEL);
  const [refreshRooms, setRefreshRooms] = useState(0);

  const handleMessage = useCallback((message: Message) => {
    setNewMessage(message);
  }, []);

  const { sendMessage } = useWebSocket({
    token,
    roomId: selectedRoom ? String(selectedRoom.id) : null,
    onMessage: handleMessage,
  });

  const handleSendMessage = (content: string) => {
    sendMessage(content);
  };

  const handleCreateRoom = async (name: string, description: string, type: ChatRoomType) => {
    await roomApi.createRoom({ name, description, type });
    setRefreshRooms(prev => prev + 1);
  };

  const handleOpenCreateRoom = (type: ChatRoomType) => {
    setCreateRoomType(type);
    setIsCreateRoomOpen(true);
  };

  const handleStartDM = async (user: User) => {
    try {
      // Create a DM room with the user
      const dmName = `DM with ${user.username}`;
      await roomApi.createRoom({
        name: dmName,
        description: `Direct message with ${user.username}`,
        type: ChatRoomType.DM
      });
      setRefreshRooms(prev => prev + 1);
    } catch (error) {
      console.error('Failed to create DM:', error);
    }
  };

  return (
    <div className="h-screen flex">
      {/* Sidebar */}
      <ChatSidebar
        key={refreshRooms}
        selectedRoom={selectedRoom}
        onSelectRoom={setSelectedRoom}
        onCreateRoom={handleOpenCreateRoom}
        onStartDM={handleStartDM}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.username.charAt(0).toUpperCase()}
            </div>
            <span className="font-medium text-gray-900">{user?.username}</span>
          </div>
          
          <button
            onClick={logout}
            className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>

        {/* Chat Content */}
        {selectedRoom ? (
          <ChatWindow
            selectedRoom={selectedRoom}
            onSendMessage={handleSendMessage}
            newMessage={newMessage}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Welcome to Chatify
              </h3>
              <p className="text-gray-500">
                Select a channel, group, or DM to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onSubmit={handleCreateRoom}
        initialType={createRoomType}
      />
    </div>
  );
};