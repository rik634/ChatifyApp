export enum ChatType {
  ROOM = 'ROOM',
  DIRECT = 'DIRECT'
}

export interface ChatItem {
  id: string;
  type: ChatType;
  name: string;
  avatar?: string;
  lastMessage?: string;
  unreadCount?: number;
  online?: boolean;
  roomId?: number;
  userId?: number;
}