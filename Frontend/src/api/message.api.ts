import { apiClient } from './axios.config';
import type { Message } from '../types/message.types';
interface PageableResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
export const messageApi = {
  // Update the return type from Message[] to PageableResponse<Message>
  getMessagesByRoom: async (roomId: number): Promise<PageableResponse<Message>> => {
    const response = await apiClient.get(`/messages/${roomId}`);
    return response.data;
  },
};