import { UserRole } from './auth.models';

export type JoinRequestStatus = 'Pending' | 'Approved' | 'Rejected' | 'Expired';

export interface WorkspaceMember {
  userId: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  avatarColor: string;
  role: UserRole;
  joinedAt: string;
}

export interface WorkspaceInvite {
  id: string;
  code: string;
  createdAt: string;
  expiresAt: string;
  maxUses?: number;
  usesCount: number;
  isExpired: boolean;
  isActive: boolean;
}

export interface JoinRequest {
  id: string;
  workspaceId: string;
  workspaceName: string;
  userId: string;
  userFullName: string;
  userUsername: string;
  userEmail: string;
  userPhone?: string;
  userAvatarColor: string;
  status: JoinRequestStatus;
  requestedAt: string;
  expiresAt: string;
  isExpired: boolean;
}

export interface WorkspaceSearch {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isMember: boolean;
  hasPendingRequest: boolean;
}

export interface WorkspaceDetail {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  myRole: UserRole;
  memberCount: number;
  members: WorkspaceMember[];
  activeInvites: WorkspaceInvite[];
  pendingRequests: JoinRequest[];
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string;
}

export interface JoinWorkspaceByCodeRequest {
  inviteCode: string;
}

export interface CreateInviteCodeRequest {
  expiryHours: number;
  maxUses?: number;
}

