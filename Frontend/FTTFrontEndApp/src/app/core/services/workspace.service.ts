import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, WorkspaceSummary, User } from '../models/auth.models';
import {
  CreateInviteCodeRequest,
  CreateWorkspaceRequest,
  JoinRequest,
  JoinWorkspaceByCodeRequest,
  WorkspaceDetail,
  WorkspaceInvite,
  WorkspaceSearch
} from '../models/workspace.models';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;

  getMyWorkspaces(): Observable<ApiResponse<WorkspaceSummary[]>> {
    return this.http.get<ApiResponse<WorkspaceSummary[]>>(`${this.apiUrl}/workspace`);
  }

  createWorkspace(request: CreateWorkspaceRequest): Observable<ApiResponse<WorkspaceDetail>> {
    return this.http.post<ApiResponse<WorkspaceDetail>>(`${this.apiUrl}/workspace`, request);
  }

  getWorkspaceDetail(workspaceId: string): Observable<ApiResponse<WorkspaceDetail>> {
    return this.http.get<ApiResponse<WorkspaceDetail>>(`${this.apiUrl}/workspace/${workspaceId}`);
  }

  joinByCode(inviteCode: string): Observable<ApiResponse<WorkspaceSummary>> {
    const request: JoinWorkspaceByCodeRequest = { inviteCode };
    return this.http.post<ApiResponse<WorkspaceSummary>>(`${this.apiUrl}/workspace/join-by-code`, request);
  }

  createInviteCode(workspaceId: string, expiryHours: number, maxUses?: number): Observable<ApiResponse<WorkspaceInvite>> {
    const request: CreateInviteCodeRequest = { expiryHours, maxUses };
    return this.http.post<ApiResponse<WorkspaceInvite>>(`${this.apiUrl}/workspace/${workspaceId}/invites`, request);
  }

  revokeInviteCode(workspaceId: string, inviteId: string): Observable<ApiResponse<boolean>> {
    return this.http.delete<ApiResponse<boolean>>(`${this.apiUrl}/workspace/${workspaceId}/invites/${inviteId}`);
  }

  searchWorkspaces(query: string): Observable<ApiResponse<WorkspaceSearch[]>> {
    return this.http.get<ApiResponse<WorkspaceSearch[]>>(`${this.apiUrl}/workspace/search?q=${encodeURIComponent(query)}`);
  }

  requestToJoin(workspaceId: string): Observable<ApiResponse<JoinRequest>> {
    return this.http.post<ApiResponse<JoinRequest>>(`${this.apiUrl}/workspace/${workspaceId}/join-request`, {});
  }

  getPendingJoinRequests(workspaceId: string): Observable<ApiResponse<JoinRequest[]>> {
    return this.http.get<ApiResponse<JoinRequest[]>>(`${this.apiUrl}/workspace/${workspaceId}/join-requests`);
  }

  respondToJoinRequest(workspaceId: string, requestId: string, approve: boolean): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/workspace/${workspaceId}/join-requests/${requestId}/respond`, { approve });
  }

  searchUsers(query: string): Observable<ApiResponse<User[]>> {
    return this.http.get<ApiResponse<User[]>>(`${this.apiUrl}/workspace/users/search?q=${encodeURIComponent(query)}`);
  }

  directInviteUser(workspaceId: string, usernameOrEmail: string): Observable<ApiResponse<boolean>> {
    return this.http.post<ApiResponse<boolean>>(`${this.apiUrl}/workspace/${workspaceId}/invite-user`, { usernameOrEmail });
  }
}

