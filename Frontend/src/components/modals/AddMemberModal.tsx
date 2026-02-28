import React, { useState, useEffect } from 'react';
import { X, Search, UserPlus, Loader2 } from 'lucide-react';
import { userApi } from '../../api/user.api';
import { roomApi } from '../../api/room.api';
import { type User } from '../../types/auth.types';
import { Avatar } from '../common/Avatar';

interface AddMemberModalProps {
  roomId: string;
  onClose: () => void;
  onMemberAdded: () => void;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({ roomId, onClose, onMemberAdded }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await userApi.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  const handleAdd = async (userId: number) => {
    try {
      // You'll need to implement this in your room.api.ts
      await roomApi.addMember(Number(roomId), userId);
      onMemberAdded();
      onClose();
    } catch (err) {
      alert("Could not add member. They might already be in the group.");
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-9999 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl w-[400px] min-h-125 shadow-2xl flex flex-col border border-gray-200">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-bold text-lg">Add Member to Group</h3>
          <button onClick={onClose} className="hover:bg-gray-100 p-1 rounded"><X /></button>
        </div>
        
        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="max-h-60 overflow-y-auto">
            {loading ? <Loader2 className="animate-spin mx-auto" /> : (
              filteredUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatarUrl ?? undefined} alt={user.username} size="sm" />
                    <span className="font-medium">{user.username}</span>
                  </div>
                  <button 
                    onClick={() => handleAdd(user.id)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-full"
                  >
                    <UserPlus className="w-5 h-5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};