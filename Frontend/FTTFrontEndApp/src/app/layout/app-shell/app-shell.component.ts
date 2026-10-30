import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WorkspaceSummary } from '../../core/models/auth.models';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <!-- Top App Header -->
      <header class="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-2.5">
        <div class="max-w-6xl mx-auto flex items-center justify-between">
          <!-- Logo & Workspace Selector -->
          <div class="flex items-center gap-3">
            <a routerLink="/" class="flex items-center gap-2.5 shrink-0">
              <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-md shadow-blue-500/20">
                <svg class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <span class="hidden sm:inline font-bold text-white text-sm tracking-tight">FTT</span>
            </a>

            <!-- Workspace Switcher Dropdown -->
            <div class="relative">
              @if (authService.activeWorkspace(); as activeWs) {
                <div class="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl px-3 py-1.5 transition-colors">
                  <div class="flex flex-col text-left">
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-bold text-white max-w-[130px] sm:max-w-[200px] truncate">
                        {{ activeWs.name }}
                      </span>
                      <span
                        class="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded"
                        [class.bg-blue-950]="activeWs.role === 'Admin'"
                        [class.text-blue-300]="activeWs.role === 'Admin'"
                        [class.border]="activeWs.role === 'Admin'"
                        [class.border-blue-800]="activeWs.role === 'Admin'"
                        [class.bg-slate-700]="activeWs.role !== 'Admin'"
                        [class.text-slate-300]="activeWs.role !== 'Admin'"
                      >
                        {{ activeWs.role }}
                      </span>
                    </div>
                  </div>

                  @if (authService.workspaces().length > 1) {
                    <button
                      type="button"
                      (click)="toggleWorkspaceMenu()"
                      class="text-slate-400 hover:text-white p-0.5"
                    >
                      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  }
                </div>
              } @else {
                <div class="px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-semibold">
                  No Active Workspace
                </div>
              }

              <!-- Workspace Switcher Menu Dropdown -->
              @if (showWorkspaceMenu()) {
                <div class="absolute left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50">
                  <div class="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                    Your Workspaces
                  </div>
                  @for (ws of authService.workspaces(); track ws.id) {
                    <button
                      type="button"
                      (click)="selectWorkspace(ws)"
                      class="w-full px-3 py-2 text-left hover:bg-slate-800 flex items-center justify-between text-xs transition-colors"
                      [class.bg-slate-800]="authService.activeWorkspace()?.id === ws.id"
                    >
                      <div class="truncate pr-2">
                        <div class="font-semibold text-white truncate">{{ ws.name }}</div>
                        <div class="text-[10px] text-slate-400">{{ ws.memberCount }} members</div>
                      </div>
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 uppercase font-bold shrink-0">
                        {{ ws.role }}
                      </span>
                    </button>
                  }
                </div>
              }
            </div>
          </div>

          <!-- User Profile & Logout -->
          <div class="flex items-center gap-3">
            <div class="hidden sm:flex flex-col text-right">
              <span class="text-xs font-semibold text-white">{{ authService.currentUser()?.fullName }}</span>
              <span class="text-[11px] text-slate-400">&#64;{{ authService.currentUser()?.username }}</span>
            </div>

            <div
              class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-md border-2 border-slate-700"
              [style.background-color]="authService.currentUser()?.avatarColor || '#2563EB'"
            >
              {{ getInitials(authService.currentUser()?.fullName) }}
            </div>

            <button
              type="button"
              (click)="authService.logout()"
              class="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
              title="Sign Out"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <!-- Main Layout Body -->
      <div class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8 flex gap-6">
        <!-- Desktop Sidebar Navigation -->
        <aside class="hidden md:block w-56 shrink-0 space-y-1">
          <a
            routerLink="/"
            routerLinkActive="bg-blue-600 text-white"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-800/80 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span>Workspace Hub</span>
          </a>

          <div class="pt-5 pb-2 px-4 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Coming in Milestone 2
          </div>

          <div class="space-y-1 opacity-60 cursor-not-allowed">
            <div class="flex items-center gap-3 px-4 py-2 text-xs text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>My Tasks</span>
            </div>
            <div class="flex items-center gap-3 px-4 py-2 text-xs text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Delegated</span>
            </div>
            <div class="flex items-center gap-3 px-4 py-2 text-xs text-slate-400">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Family Public Feed</span>
            </div>
          </div>
        </aside>

        <!-- Main Content Outlet -->
        <main class="flex-1 min-w-0">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Bottom Navigation Bar -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-6 py-2.5 flex items-center justify-around">
        <a
          routerLink="/"
          routerLinkActive="text-blue-400"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-400"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Workspaces</span>
        </a>

        <div class="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-600">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Tasks (M2)</span>
        </div>

        <button
          type="button"
          (click)="authService.logout()"
          class="flex flex-col items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-red-400"
        >
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  `
})
export class AppShellComponent {
  readonly authService = inject(AuthService);
  readonly showWorkspaceMenu = signal(false);

  toggleWorkspaceMenu(): void {
    this.showWorkspaceMenu.update(v => !v);
  }

  selectWorkspace(ws: WorkspaceSummary): void {
    this.authService.setActiveWorkspace(ws);
    this.showWorkspaceMenu.set(false);
  }

  getInitials(name?: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
