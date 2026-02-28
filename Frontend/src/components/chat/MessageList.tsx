import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { format, parseISO } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

interface Message {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  timestamp: string;
  type: 'SYSTEM' | 'USER';
  edited?: boolean;
}

interface MessageListProps {
  messages: Message[];
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, onEdit, onDelete }) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleStartEdit = (message: Message) => {
    setEditingId(message.id);
    setEditContent(message.content);
  };

  const handleSaveEdit = (id: string) => {
    const originalMessage = messages.find(m => String(m.id) === String(id));
    if (editContent.trim() && editContent !== originalMessage?.content) {
      onEdit(id, editContent);
    }
    setEditingId(null);
  };

  const formatTime = (timestamp: string) => {
    try {
      return format(parseISO(timestamp), 'HH:mm');
    } catch {
      return format(new Date(timestamp), 'HH:mm');
    }
  };

  const groupedMessages = useMemo(() => {
    const groups: Record<string, Message[]> = {};
    messages.forEach(msg => {
      try {
        const date = format(parseISO(msg.timestamp), 'MMM dd, yyyy');
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
      } catch {
        const date = format(new Date(msg.timestamp), 'MMM dd, yyyy');
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
      }
    });
    return groups;
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-scrollbar bg-gray-50/50">
      {Object.entries(groupedMessages).map(([date, msgs]) => (
        <div key={date} className="space-y-4">
          <div className="flex items-center justify-center my-6">
            <div className="bg-white text-gray-400 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-gray-200 shadow-sm">
              {date}
            </div>
          </div>

          {msgs.map((message) => {
            const isOwn = String(message.senderId) === String(user?.id);
            const isEditing = editingId === message.id;
            const isSystem = message.type === 'SYSTEM';

            if (isSystem) {
              return (
                <div key={message.id} className="flex justify-center my-2">
                  <span className="bg-indigo-50/50 text-indigo-500 text-[11px] px-4 py-1 rounded-full border border-indigo-100/50 italic">
                    {message.content}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={message.id}
                className={`flex w-full ${isOwn ? 'justify-end' : 'justify-start'} group mb-2 animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                <div className={`flex max-w-[80%] ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2`}>
                  
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm transition-transform hover:scale-110 ${
                    isOwn ? 'bg-indigo-600 ml-1' : 'bg-slate-500 mr-1'
                  }`}>
                    {message.senderName?.charAt(0).toUpperCase() || '?'}
                  </div>

                  {/* Message Bubble Column */}
                  <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
                    
                    {/* Tooltip-style Actions (Pencil/Trash) */}
                    {isOwn && !isEditing && (
                      <div className="opacity-0 group-hover:opacity-100 flex items-center mb-1 bg-white border border-gray-200 rounded-lg shadow-sm transition-all overflow-hidden h-7">
                        <button 
                          onClick={() => handleStartEdit(message)}
                          className="p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 border-r border-gray-100"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                        <button 
                          onClick={() => onDelete(message.id)}
                          className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}

                    {/* The Bubble */}
                    <div className={`relative px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      isOwn 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                    }`}>
                      {isEditing ? (
                        <div className="min-w-[200px]">
                          <textarea
                            className="w-full p-2 text-sm text-gray-900 bg-white border border-gray-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSaveEdit(message.id);
                              }
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button onClick={() => setEditingId(null)} className="text-[10px] text-white/80 hover:text-white">Cancel</button>
                            <button onClick={() => handleSaveEdit(message.id)} className="bg-white text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold">Save</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col">
                          {!isOwn && (
                            <span className="text-[10px] font-bold opacity-70 mb-1">
                              {message.senderName}
                            </span>
                          )}
                          <p className="whitespace-pre-wrap wrap-break-word leading-relaxed">
                            {message.content}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Metadata (Time + Edited tag) */}
                    <div className={`flex items-center mt-1 space-x-1 ${isOwn ? 'flex-row' : 'flex-row-reverse'}`}>
                      {message.edited && (
                        <span className="text-[9px] text-indigo-400 italic">edited</span>
                      )}
                      <span className="text-[9px] text-gray-400 font-medium">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} className="h-4" />
    </div>
  );
};