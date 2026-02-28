import React, { useEffect, useState } from 'react';
import { type ChatRoom } from '../../types/room.types';
import { type Message } from '../../types/message.types';
import { messageApi } from '../../api/message.api';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { Hash, Loader2, WifiOff, User as UserIcon } from 'lucide-react';
import { AddMemberModal } from '../modals/AddMemberModal';
import { wsService } from '../../utils/websocket';
import { useAuth } from '../../hooks/useAuth';
import { MembersModal } from '../modals/MemberModal';

interface ChatWindowProps {
  selectedRoom: ChatRoom;
  onSendMessage: (content: string) => void;
  newMessage?: Message;
  isConnected?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedRoom,
  onSendMessage,
  newMessage,
  isConnected = true
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);

  const { user } = useAuth();
  
  // Helper to determine if the current room is a Direct Message
  const isDM = selectedRoom.type === 'DM';

  const creatorId = typeof selectedRoom.createdBy === 'object'
    ? (selectedRoom.createdBy as any).id
    : selectedRoom.createdBy;
    
  const isAdmin = String(creatorId) === String(user?.id);

  // 1. Load History
  useEffect(() => {
    loadMessages();
  }, [selectedRoom.id]);

  // 2. Real-time Subscriptions
  useEffect(() => {
    if (!isConnected || !selectedRoom.id) return;

    const subscribeToRoomEvents = async () => {
      try {
        const client = wsService.getClient();
        if (!client || !client.connected) return;

        const roomId = selectedRoom.id;

        // NEW MESSAGES
        const subNew = client.subscribe(`/topic/room/${roomId}`, (payload) => {
          const msg = JSON.parse(payload.body);
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        });

        // EDITS
        const editSub = client.subscribe(`/topic/room/${roomId}/edit`, (payload) => {
          const updatedMsg = JSON.parse(payload.body);
          setMessages((current) =>
            current.map((m) => String(m.id) === String(updatedMsg.id) ? { ...m, ...updatedMsg } : m)
          );
        });

        // DELETES
        const deleteSub = client.subscribe(`/topic/room/${roomId}/delete`, (payload) => {
          const deletedId = payload.body;
          setMessages(prev => prev.filter(m => String(m.id) !== String(deletedId)));
        });

        return () => {
          subNew.unsubscribe();
          editSub.unsubscribe();
          deleteSub.unsubscribe();
        };
      } catch (err) {
        console.error("Subscription error:", err);
      }
    };

    subscribeToRoomEvents();
  }, [selectedRoom.id, isConnected]);

  // 3. Handle prop-based new messages
  useEffect(() => {
    if (newMessage && String(newMessage.roomId) === String(selectedRoom.id)) {
      setMessages(prev => {
        const index = prev.findIndex(m => m.id === newMessage.id);
        if (index !== -1) {
          const newArray = [...prev];
          newArray[index] = newMessage;
          return newArray;
        }
        return [...prev, newMessage];
      });
    }
  }, [newMessage, selectedRoom.id]);

  const loadMessages = async () => {
    setLoading(true);
    try {
      const response = await messageApi.getMessagesByRoom(selectedRoom.id);
      const messageArray = response?.content || (Array.isArray(response) ? response : []);
      setMessages([...messageArray].reverse());
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center space-x-3">
          {isDM ? (
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <UserIcon className="w-5 h-5" />
            </div>
          ) : (
            <Hash className="w-6 h-6 text-gray-400" />
          )}
          <div>
            <h3 className="font-bold text-gray-900">
                {isDM ? selectedRoom.name : selectedRoom.name}
            </h3>
            {selectedRoom.description && !isDM && (
              <p className="text-xs text-gray-500 line-clamp-1">{selectedRoom.description}</p>
            )}
            {isDM && (
                <p className="text-xs text-green-500 font-medium">Direct Message</p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Only show Members and Add Member if NOT a DM */}
          {!isDM && (
            <>
              <button
                onClick={() => setIsMembersModalOpen(true)}
                className="text-gray-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-50 rounded-md"
              >
                Members
              </button>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium shadow-sm"
              >
                Add Member
              </button>
            </>
          )}
        </div>
      </div>

      {!isConnected && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center space-x-2 text-amber-800 animate-pulse">
          <WifiOff className="w-4 h-4" />
          <p className="text-sm font-medium">Connection lost. Attempting to reconnect...</p>
        </div>
      )}

      <div className="flex-1 overflow-hidden flex flex-col relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <MessageList
            messages={messages.map(msg => ({
              ...msg,
              senderId: String(msg.senderId),
              type: msg.type as "SYSTEM" | "USER"
            }))}
            onEdit={(messageId, content) => {
              if (user?.email) {
                wsService.editMessage(
                  selectedRoom.id.toString(),
                  messageId,
                  content,
                  user.email
                );
              }
            }}
            onDelete={(id) => wsService.deleteMessage(selectedRoom.id.toString(), id)}
          />
        )}
      </div>

      <MessageInput
        onSend={onSendMessage}
        placeholder={isDM ? `Message ${selectedRoom.name}` : `Message #${selectedRoom.name}`}
        disabled={!isConnected}
      />

      {isAddModalOpen && (
        <AddMemberModal
          roomId={selectedRoom.id.toString()}
          onClose={() => setIsAddModalOpen(false)}
          onMemberAdded={() => console.log("Member added!")}
        />
      )}

      {isMembersModalOpen && (
        <MembersModal
          roomId={selectedRoom.id.toString()}
          isAdmin={isAdmin}
          currentUserId={user?.id}
          onClose={() => setIsMembersModalOpen(false)}
        />
      )}
    </div>
  );
};