export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}


export interface User {
  id: number;      // Matches Long in Java
  username: string;
  email: string;
  avatarUrl: string | null;
  active: boolean; // Matches the 'active' field in your Entity
  createdAt: string; 
}