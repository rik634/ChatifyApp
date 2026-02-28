export interface User {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  active: boolean; // From 'is_active' column
  createdAt: string;
  updatedAt: string | null;
}

// This matches your UserResponse DTO specifically
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  avatarUrl: string | null;
  createdAt: string;
}