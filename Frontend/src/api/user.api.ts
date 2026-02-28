import { apiClient } from './axios.config';
import type { User, UserResponse } from '../types/user.types';

export const userApi = {

    getAllUsers: async (): Promise<User[]> => {
    const response = await apiClient.get('/users');
    return response.data;
  },
  /**
   * GET /api/users/me
   * Fetches the profile of the currently logged-in user.
   */

  getCurrentUser: async (): Promise<UserResponse> => {
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  /**
   * GET /api/users/search?username=...
   * Used for the discovery bar to find people to start a DM with.
   */
  searchUsers: async (username: string): Promise<UserResponse[]> => {
    const response = await apiClient.get('/users/search', {
      params: { username }
    });
    return response.data;
  },

  /**
   * GET /api/users/{id}
   * Fetches public profile details of any user by their MySQL ID.
   */
  getUserById: async (id: number): Promise<UserResponse> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },
};