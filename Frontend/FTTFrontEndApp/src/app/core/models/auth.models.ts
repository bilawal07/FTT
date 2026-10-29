export type UserRole = 'Admin' | 'Member';

export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  avatarColor: string;
  createdAt: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  description?: string;
  role: UserRole;
  memberCount: number;
  joinedAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: User;
  workspaces: WorkspaceSummary[];
}

export interface CurrentUserResponse {
  user: User;
  workspaces: WorkspaceSummary[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  username: string;
  email: string;
  password: string;
  phoneNumber?: string;
  address?: string;
  avatarColor?: string;
}
