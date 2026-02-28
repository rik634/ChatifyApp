export interface Message {
  type: string;
  id: string; // MongoDB ObjectId
  senderId: number;
  roomId: string; // Room ID is often handled as String for MongoDB mapping
  senderName: string;
  content: string;
  timestamp: string;
  edited: boolean;
}

export interface EditMessageRequest {
  messageId: string;
  requesterId: number;
  newContent: string;
}

// Support for the Spring "Page" object returned by your GetMapping
export interface MessagePage {
  content: Message[];
  totalPages: number;
  totalElements: number;
  last: boolean;
}
export interface SendMessageRequest {
  content: string;
}