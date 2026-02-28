import React, { useEffect, useState } from 'react';
import { X, Trash2, Mail, Shield } from 'lucide-react';
import axios from 'axios';

interface User {
  id: string | number;
  username: string;
  email: string;
}

interface MembersModalProps {
  roomId: string;
  onClose: () => void;
  isAdmin: boolean;
  currentUserId: string | number | undefined;
}

export const MembersModal: React.FC<MembersModalProps> = ({
  roomId,
  onClose,
  isAdmin,
  currentUserId
}) => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        if (!token) return;
        setLoading(true);
        const response = await axios.get(`/api/rooms/${roomId}/members`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Handle both Array response and Spring Page (.content) response
        const data = Array.isArray(response.data) ? response.data : response.data.content || [];
        setMembers(data);
      } catch (err) {
        console.error("Failed to load members", err);
        setMembers([]);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) fetchMembers();
  }, [roomId, token]);

  const handleRemove = async (userId: string | number, username: string) => {
    if (window.confirm(`Are you sure you want to remove ${username} from this room?`)) {
      try {
        await axios.delete(`/api/rooms/${roomId}/members/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Update local state to remove the user from the list
        setMembers(prev => prev.filter(m => String(m.id) !== String(userId)));
      } catch (err) {
        console.error("Remove failed", err);
        alert("Action failed: Ensure you are the room admin.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-gray-900">Room Members</h2>
            {!loading && (
              <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                {members.length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Member List */}
        <div className="max-h-[400px] min-h-[200px] overflow-y-auto p-2 chat-scrollbar">
          {loading ? (
            <div className="p-12 text-center text-gray-400">
              <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mb-2"></div>
              <p className="text-sm font-medium">Fetching member list...</p>
            </div>
          ) : members.length > 0 ? (
            <div className="space-y-1">
              {members.map((member) => {
                // FORCE STRING COMPARISON TO AVOID TYPE MISMATCH (e.g. "4" vs 4)
                const isMe = String(member.id) === String(currentUserId);

                return (
                  <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-xl group transition-all">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold shadow-sm">
                        {member.username?.charAt(0).toUpperCase() || '?'}
                      </div>

                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900 text-sm">{member.username}</span>
                          {isMe && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase">You</span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail size={12} className="mr-1 opacity-70" />
                          {member.email}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {/* LOGIC: 
                          1. Must be admin to see any action
                          2. Cannot remove yourself 
                      */}
                      {isAdmin && !isMe ? (
                        <button
                          onClick={() => handleRemove(member.id, member.username)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove Member"
                        >
                          <Trash2 size={16} />
                        </button>
                      ) : (isMe && isAdmin) ? (
                        <div title="Room Admin" className="flex items-center bg-amber-50 px-2 py-1 rounded border border-amber-100">
                          <Shield size={14} className="text-amber-500 mr-1" />
                          <span className="text-[10px] text-amber-700 font-bold uppercase">Admin</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No members found in this room.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t text-center">
          <button onClick={onClose} className="w-full py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors shadow-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};