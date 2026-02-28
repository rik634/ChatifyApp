import React, { useState } from 'react';
import { X, Hash, Users, Radio } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ChatRoomType } from '../../types/room.types';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, type: ChatRoomType) => Promise<void>;
  initialType?: ChatRoomType;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialType = ChatRoomType.CHANNEL
}) => {
  const [roomName, setRoomName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ChatRoomType>(initialType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    setType(initialType);
  }, [initialType]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSubmit(roomName.trim(), description.trim(), type);
      setRoomName('');
      setDescription('');
      setType(ChatRoomType.CHANNEL);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (roomType: ChatRoomType) => {
    switch (roomType) {
      case ChatRoomType.CHANNEL:
        return <Radio className="w-5 h-5" />;
      case ChatRoomType.GROUP:
        return <Users className="w-5 h-5" />;
      case ChatRoomType.DM:
        return <Hash className="w-5 h-5" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case ChatRoomType.CHANNEL:
        return 'Create Channel';
      case ChatRoomType.GROUP:
        return 'Create Group';
      case ChatRoomType.DM:
        return 'Start Direct Message';
    }
  };

  const getDescription = () => {
    switch (type) {
      case ChatRoomType.CHANNEL:
        return 'Channels are where your team communicates. They\'re best organized around a topic — #marketing, for example.';
      case ChatRoomType.GROUP:
        return 'Groups are perfect for teams or projects with a specific set of members.';
      case ChatRoomType.DM:
        return 'Start a private conversation with another user.';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-6">{getDescription()}</p>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType(ChatRoomType.CHANNEL)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  type === ChatRoomType.CHANNEL
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Radio className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Channel</span>
              </button>
              <button
                type="button"
                onClick={() => setType(ChatRoomType.GROUP)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  type === ChatRoomType.GROUP
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Users className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">Group</span>
              </button>
              <button
                type="button"
                onClick={() => setType(ChatRoomType.DM)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-colors ${
                  type === ChatRoomType.DM
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Hash className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">DM</span>
              </button>
            </div>
          </div>

          <Input
            label={type === ChatRoomType.CHANNEL ? 'Channel Name' : type === ChatRoomType.GROUP ? 'Group Name' : 'DM Name'}
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder={type === ChatRoomType.CHANNEL ? 'e.g., marketing' : 'e.g., Project Team'}
            autoFocus
          />

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this about?"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mt-6 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};