import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  AuthResponse,
  CurrentUserResponse,
  LoginRequest,
  RegisterRequest,
  User,
  WorkspaceSummary
} from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly apiUrl = environment.apiUrl;

  readonly token = signal<string | null>(this.getStoredItem('ftt_token'));
  readonly refreshTokenStr = signal<string | null>(this.getStoredItem('ftt_refresh_token'));
  readonly currentUser = signal<User | null>(this.getStoredJson<User>('ftt_user'));
  readonly workspaces = signal<WorkspaceSummary[]>(this.getStoredJson<WorkspaceSummary[]>('ftt_workspaces') || []);
  readonly activeWorkspace = signal<WorkspaceSummary | null>(this.getStoredJson<WorkspaceSummary>('ftt_active_workspace'));

  readonly isLoading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  readonly isAuthenticated = computed(() => !!this.token() && !!this.currentUser());
  readonly isWorkspaceAdmin = computed(() => this.activeWorkspace()?.role === 'Admin');

  constructor() {
    if (this.token()) {
      this.loadCurrentUser().subscribe({
        error: () => this.logout()
      });
    }
  }

  register(request: RegisterRequest): Observable<ApiResponse<AuthResponse>> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/register`, request).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Registration failed. Please check your information.';
        this.errorMessage.set(msg);
        return throwError(() => err);
      })
    );
  }

  login(request: LoginRequest): Observable<ApiResponse<AuthResponse>> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/login`, request).pipe(
      tap((res) => {
        this.isLoading.set(false);
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
        }
      }),
      catchError((err) => {
        this.isLoading.set(false);
        const msg = err.error?.message || 'Login failed. Please check your credentials.';
        this.errorMessage.set(msg);
        return throwError(() => err);
      })
    );
  }

  refreshToken(): Observable<ApiResponse<AuthResponse> | null> {
    const refresh = this.refreshTokenStr();
    if (!refresh) {
      this.logout();
      return of(null);
    }

    return this.http.post<ApiResponse<AuthResponse>>(`${this.apiUrl}/auth/refresh`, { refreshToken: refresh }).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
        }
      }),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  loadCurrentUser(): Observable<ApiResponse<CurrentUserResponse>> {
    return this.http.get<ApiResponse<CurrentUserResponse>>(`${this.apiUrl}/auth/me`).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.currentUser.set(res.data.user);
          this.workspaces.set(res.data.workspaces);
          localStorage.setItem('ftt_user', JSON.stringify(res.data.user));
          localStorage.setItem('ftt_workspaces', JSON.stringify(res.data.workspaces));

          // Set active workspace if not already set or not in current list
          const currentActive = this.activeWorkspace();
          if (!currentActive || !res.data.workspaces.some(w => w.id === currentActive.id)) {
            if (res.data.workspaces.length > 0) {
              this.setActiveWorkspace(res.data.workspaces[0]);
            } else {
              this.activeWorkspace.set(null);
              localStorage.removeItem('ftt_active_workspace');
            }
          }
        }
      })
    );
  }

  setActiveWorkspace(ws: WorkspaceSummary): void {
    this.activeWorkspace.set(ws);
    localStorage.setItem('ftt_active_workspace', JSON.stringify(ws));
  }

  logout(): void {
    this.token.set(null);
    this.refreshTokenStr.set(null);
    this.currentUser.set(null);
    this.workspaces.set([]);
    this.activeWorkspace.set(null);
    this.errorMessage.set(null);

    localStorage.removeItem('ftt_token');
    localStorage.removeItem('ftt_refresh_token');
    localStorage.removeItem('ftt_user');
    localStorage.removeItem('ftt_workspaces');
    localStorage.removeItem('ftt_active_workspace');

    this.router.navigate(['/login']);
  }

  private handleAuthSuccess(data: AuthResponse): void {
    this.token.set(data.accessToken);
    this.refreshTokenStr.set(data.refreshToken);
    this.currentUser.set(data.user);
    this.workspaces.set(data.workspaces);

    localStorage.setItem('ftt_token', data.accessToken);
    localStorage.setItem('ftt_refresh_token', data.refreshToken);
    localStorage.setItem('ftt_user', JSON.stringify(data.user));
    localStorage.setItem('ftt_workspaces', JSON.stringify(data.workspaces));

    if (data.workspaces.length > 0) {
      this.setActiveWorkspace(data.workspaces[0]);
    } else {
      this.activeWorkspace.set(null);
      localStorage.removeItem('ftt_active_workspace');
    }

    this.router.navigate(['/']);
  }

  private getStoredItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private getStoredJson<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
}
