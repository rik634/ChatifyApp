export enum ChatRoomType {
  CHANNEL = 'CHANNEL',
  GROUP = 'GROUP',
  DM = 'DM'
}

export interface ChatRoom {
  id: number;
  name: string;
  description: string;
  type: ChatRoomType;
  active: boolean;
  createdBy: {
    id: number;
    username: string;
  } | number | string;
}

export interface RoomMember {
  id: number;
  userId: number;
  role: string; // Matches your MemberType Enum
}

export interface ChatRoomResponse {
  room: ChatRoom;
  members: RoomMember[];
}

export interface CreateRoomRequest {
  name: string;
  description: string;
  type: ChatRoomType;
}


