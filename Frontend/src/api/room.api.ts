import { apiClient } from './axios.config';
import type { ChatRoom, ChatRoomResponse, CreateRoomRequest } from '../types/room.types';
import type { User } from '../types/auth.types';

export const roomApi = {
    // GET /api/rooms/my-rooms
  getRooms: async (): Promise<ChatRoom[]> => {
    const response = await apiClient.get('/rooms/my-rooms');
    return response.data;
  },

 // GET /api/rooms/{roomId}
  getRoomDetails: async (roomId: number): Promise<ChatRoomResponse> => {
    const response = await apiClient.get(`/rooms/${roomId}`);
    return response.data;
  },

  // POST /api/rooms/create
  createRoom: async (roomData: CreateRoomRequest): Promise<ChatRoom> => {
    const response = await apiClient.post('/rooms/create', roomData);
    return response.data;
  },

  // POST /api/rooms/dm/{targetUserId}
  getOrCreateDM: async (targetUserId: number): Promise<ChatRoom> => {
    const response = await apiClient.post(`/rooms/dm/${targetUserId}`);
    return response.data;
  },

  // POST /api/rooms/{roomId}/members/{targetUserId}
  addMember: async (roomId: number, targetUserId: number): Promise<string> => {
    const response = await apiClient.post(`/rooms/${roomId}/members/${targetUserId}`);
    return response.data; // Returns "Member added"
  },

  // DELETE /api/rooms/{roomId}
  deleteRoom: async (roomId: number): Promise<string> => {
    const response = await apiClient.delete(`/rooms/${roomId}`);
    return response.data; // Returns "Room deactivated"
  },

  // GET /api/rooms/public
  getPublicRooms: async (): Promise<ChatRoomResponse[]> => {
    const response = await apiClient.get('/rooms/public');
    return response.data;
  }
  ,
  getMembers: async (roomId: string): Promise<User[]> => {
    const response = await apiClient.get(`/rooms/${roomId}/members`);
    return response.data;
  }
};