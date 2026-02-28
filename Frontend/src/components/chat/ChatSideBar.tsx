import React, { useEffect, useState } from 'react';
import { roomApi } from '../../api/room.api';
import { userApi } from '../../api/user.api';
import { type ChatRoom, ChatRoomType } from '../../types/room.types';
import { type User } from '../../types/auth.types';
import { useAuth } from '../../hooks/useAuth';
import { 
  MessageSquare, 
  Plus, 
  Hash, 
  Loader2, 
  Users, 
  User as UserIcon, 
  Search, 
  X,
  Radio
} from 'lucide-react';
import { Avatar } from '../common/Avatar';

interface ChatSidebarProps {
  selectedRoom: ChatRoom | null;
  onSelectRoom: (room: ChatRoom) => void;
  onCreateRoom: (type: ChatRoomType) => void;
  onStartDM: (user: User) => void;
}

type TabType = 'channels' | 'groups' | 'dms';

export const ChatSidebar: React.FC<ChatSidebarProps> = ({ 
  selectedRoom,
  onSelectRoom,
  onCreateRoom,
  onStartDM
}) => {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('channels');
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [roomsData, usersData] = await Promise.all([
        roomApi.getRooms(),
        userApi.getAllUsers()
      ]);
      setRooms(roomsData);
     // FIX: Stringify both sides of the comparison to avoid number/string mismatch
   const filteredUsers = usersData.filter(u => 
      String(u.id) !== String(currentUser?.id)
    );
    
    setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter rooms by type
  const channels = rooms.filter(r => r.type === ChatRoomType.CHANNEL && r.active);
  const groups = rooms.filter(r => r.type === ChatRoomType.GROUP && r.active);
  const dms = rooms.filter(r => r.type === ChatRoomType.DM && r.active);

  const getFilteredRooms = () => {
    let filtered: ChatRoom[] = [];
    
    switch (activeTab) {
      case 'channels':
        filtered = channels;
        break;
      case 'groups':
        filtered = groups;
        break;
      case 'dms':
        filtered = dms;
        break;
    }

    if (searchQuery) {
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

 // Ensure we handle the search query for the User list as well
const filteredUsers = users.filter(user =>
  user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
  user.email.toLowerCase().includes(searchQuery.toLowerCase())
);

  const filteredRooms = getFilteredRooms();

  const getRoomIcon = (type: ChatRoomType) => {
    switch (type) {
      case ChatRoomType.CHANNEL:
        return <Hash className="w-5 h-5 text-gray-400 shrink-0" />;
      case ChatRoomType.GROUP:
        return <Users className="w-5 h-5 text-gray-400 shrink-0" />;
      case ChatRoomType.DM:
        return <UserIcon className="w-5 h-5 text-gray-400 shrink-0" />;
    }
  };

  const getCreateButtonText = () => {
    switch (activeTab) {
      case 'channels':
        return 'New Channel';
      case 'groups':
        return 'New Group';
      case 'dms':
        return 'New DM';
    }
  };

 const handleCreate = () => {
    switch (activeTab) {
      case 'channels':
        onCreateRoom(ChatRoomType.CHANNEL);
        break;
      case 'groups':
        onCreateRoom(ChatRoomType.GROUP);
        break;
      case 'dms':
        // FIX: Clear search to show all potential users to start a DM with
        setSearchQuery('');
        // Optional: Add a ref to the search input and focus it
        document.querySelector<HTMLInputElement>('input[placeholder="Search users..."]')?.focus();
        break;
    }
  };

  return (
    <div className="w-64 bg-gray-800 text-white flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <h2 className="font-bold text-lg">Chatify</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col space-y-1 mb-4">
          <button
            onClick={() => setActiveTab('channels')}
            className={`flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'channels'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Channels</span>
            <span className="ml-auto text-xs bg-gray-900 px-2 py-0.5 rounded-full">
              {channels.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('groups')}
            className={`flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'groups'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Groups</span>
            <span className="ml-auto text-xs bg-gray-900 px-2 py-0.5 rounded-full">
              {groups.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('dms')}
            className={`flex items-center space-x-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'dms'
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Direct Messages</span>
            <span className="ml-auto text-xs bg-gray-900 px-2 py-0.5 rounded-full">
              {dms.length}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={activeTab === 'dms' ? 'Search users...' : 'Search...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-gray-900 text-white text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Create Button */}
        <button
          onClick={handleCreate}
          className="w-full mt-3 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          {getCreateButtonText()}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto chat-scrollbar">
  {loading ? (
    <div className="flex items-center justify-center h-32">
      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
    </div>
  ) : (
    <div className="flex flex-col space-y-4">
      
      {/* SECTION 1: Existing Conversations (Rooms) */}
      {filteredRooms.length > 0 && (
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Recent Chats
          </div>
          {filteredRooms.map((room) => (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room)}
              className={`w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700 transition-colors ${
                selectedRoom?.id === room.id ? 'bg-gray-700 border-l-4 border-blue-500' : ''
              }`}
            >
              {getRoomIcon(room.type)}
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium truncate">{room.name}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* SECTION 2: Search Results / New Users */}
      {activeTab === 'dms' && (
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {searchQuery ? 'Search Results' : 'Suggested Users'}
          </div>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => {
                  onStartDM(user);
                  setSearchQuery(''); // Clear search after selecting
                }}
                className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-700 transition-colors group"
              >
                <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="sm" online={user.active} />
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate group-hover:text-blue-400">
                    {user.username}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </button>
            ))
          ) : (
             <div className="px-4 py-3 text-sm text-gray-500 italic">
               No users found for "{searchQuery}"
             </div>
          )}
        </div>
      )}

      {/* SECTION 3: Empty State (If nothing at all exists) */}
      {filteredRooms.length === 0 && (activeTab !== 'dms' || filteredUsers.length === 0) && (
        <div className="p-8 text-center text-gray-500">
          <p className="text-sm">Nothing to show here.</p>
        </div>
      )}
    </div>
  )}
</div>

    </div>
  );
};