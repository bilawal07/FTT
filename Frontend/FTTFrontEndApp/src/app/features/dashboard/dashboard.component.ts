import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { WorkspaceService } from '../../core/services/workspace.service';
import { WorkspaceDetail, WorkspaceSearch } from '../../core/models/workspace.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="space-y-6">
      <!-- Welcome Hero Banner -->
      <div class="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-slate-800 p-6 sm:p-8 backdrop-blur-xl">
        <div class="relative z-10 max-w-2xl">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-[11px] font-semibold text-emerald-400 mb-3">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Multi-Workspace Architecture Online &bull; Expiring Invites &amp; Roles
          </span>
          <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome, {{ authService.currentUser()?.fullName }}! 👋
          </h2>
          <p class="text-sm text-slate-300 mt-2 leading-relaxed">
            You can create your own workspaces as <strong class="text-blue-300">Admin</strong>, 
            generate time-limited invite codes for your siblings, and also be a member in other family or work groups.
          </p>
        </div>
      </div>

      <!-- Toast Feedback Message -->
      @if (feedbackMessage()) {
        <div class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            <span>{{ feedbackMessage() }}</span>
          </div>
          <button (click)="feedbackMessage.set(null)" class="text-slate-400 hover:text-white">&times;</button>
        </div>
      }

      @if (errorMessage()) {
        <div class="p-4 rounded-2xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center justify-between">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ errorMessage() }}</span>
          </div>
          <button (click)="errorMessage.set(null)" class="text-slate-400 hover:text-white">&times;</button>
        </div>
      }

      <!-- Top Action Bar: Create / Join Workspace Buttons -->
      <div class="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div class="text-xs text-slate-400">
          Workspaces: <strong class="text-white">{{ authService.workspaces().length }}</strong> joined
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            (click)="showCreateModal.set(true)"
            class="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-blue-600/20"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Workspace</span>
          </button>

          <button
            type="button"
            (click)="showJoinModal.set(true)"
            class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Join with Code / Search</span>
          </button>
        </div>
      </div>

      <!-- CASE 1: USER HAS NO WORKSPACES YET -->
      @if (authService.workspaces().length === 0) {
        <div class="p-8 sm:p-12 text-center rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 space-y-4">
          <div class="w-16 h-16 rounded-full bg-blue-950/60 border border-blue-800 flex items-center justify-center mx-auto text-blue-400">
            <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 class="text-xl font-bold text-white">No Workspace Yet</h3>
          <p class="text-xs text-slate-400 max-w-md mx-auto">
            You have registered your global account. You can now create your family workspace or join an existing one using an invite code given by your siblings.
          </p>
          <div class="flex items-center justify-center gap-3 pt-2">
            <button
              (click)="showCreateModal.set(true)"
              class="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all"
            >
              Create Your First Workspace
            </button>
            <button
              (click)="showJoinModal.set(true)"
              class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs transition-all"
            >
              Enter Invite Code
            </button>
          </div>
        </div>
      }

      <!-- CASE 2: USER HAS ACTIVE WORKSPACE -->
      @if (workspaceDetail(); as ws) {
        <!-- Workspace Header Card -->
        <div class="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="flex items-center gap-2.5">
                <h3 class="text-xl font-bold text-white">{{ ws.name }}</h3>
                <span
                  class="text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                  [class.bg-blue-950]="ws.myRole === 'Admin'"
                  [class.text-blue-300]="ws.myRole === 'Admin'"
                  [class.border]="ws.myRole === 'Admin'"
                  [class.border-blue-800]="ws.myRole === 'Admin'"
                  [class.bg-slate-800]="ws.myRole !== 'Admin'"
                  [class.text-slate-300]="ws.myRole !== 'Admin'"
                >
                  My Role: {{ ws.myRole }}
                </span>
              </div>
              @if (ws.description) {
                <p class="text-xs text-slate-400 mt-1">{{ ws.description }}</p>
              }
            </div>

            <!-- Quick Metrics -->
            <div class="flex items-center gap-3">
              <div class="text-right">
                <div class="text-xs text-slate-400">Total Members</div>
                <div class="text-lg font-bold text-white">{{ ws.memberCount }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ADMIN CONTROLS SECTION -->
        @if (ws.myRole === 'Admin') {
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-bold text-white flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Admin Management Center</span>
              </h4>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Expiring Invite Codes Panel -->
              <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="text-xs font-bold text-white">Time-Limited Invite Codes</h5>
                    <p class="text-[11px] text-slate-400">Share with siblings to allow them to join</p>
                  </div>
                  <button
                    (click)="showCreateInviteModal.set(true)"
                    class="px-2.5 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-700/50 text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span>+ Generate Code</span>
                  </button>
                </div>

                <div class="space-y-2">
                  @for (invite of ws.activeInvites; track invite.id) {
                    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <div>
                        <div class="flex items-center gap-2">
                          <span class="font-mono font-bold text-sm text-blue-300 tracking-wider">{{ invite.code }}</span>
                          <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Active
                          </span>
                        </div>
                        <div class="text-[10px] text-slate-400 mt-0.5">
                          Expires: {{ formatDateTime(invite.expiresAt) }} &bull; Uses: {{ invite.usesCount }}{{ invite.maxUses ? '/' + invite.maxUses : '' }}
                        </div>
                      </div>

                      <div class="flex items-center gap-1.5">
                        <button
                          type="button"
                          (click)="copyCode(invite.code)"
                          class="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-medium text-white transition-colors flex items-center gap-1"
                        >
                          <span>Copy</span>
                        </button>
                        <button
                          type="button"
                          (click)="revokeInvite(invite.id)"
                          class="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700"
                          title="Revoke code"
                        >
                          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  } @empty {
                    <div class="py-4 text-center text-xs text-slate-500">
                      No active invite codes. Click "+ Generate Code" to create one.
                    </div>
                  }
                </div>
              </div>

              <!-- Pending Join Requests Panel -->
              <div class="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h5 class="text-xs font-bold text-white">Pending Join Requests</h5>
                    <p class="text-[11px] text-slate-400">Users requesting to join this workspace</p>
                  </div>
                  <span class="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {{ ws.pendingRequests.length }}
                  </span>
                </div>

                <div class="space-y-2">
                  @for (req of ws.pendingRequests; track req.id) {
                    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <div
                          class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                          [style.background-color]="req.userAvatarColor || '#2563EB'"
                        >
                          {{ getInitials(req.userFullName) }}
                        </div>
                        <div class="truncate">
                          <div class="text-xs font-bold text-white truncate">{{ req.userFullName }}</div>
                          <div class="text-[10px] text-slate-400 truncate">&#64;{{ req.userUsername }} &bull; {{ req.userEmail }}</div>
                          @if (req.userPhone) {
                            <div class="text-[10px] text-slate-500">{{ req.userPhone }}</div>
                          }
                        </div>
                      </div>

                      <div class="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          (click)="respondJoinRequest(req.id, true)"
                          class="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          (click)="respondJoinRequest(req.id, false)"
                          class="px-2.5 py-1 rounded-lg bg-red-900/50 hover:bg-red-900 text-red-300 text-xs font-semibold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  } @empty {
                    <div class="py-4 text-center text-xs text-slate-500">
                      No pending join requests at this time.
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Direct Invite Existing User -->
            <div class="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h5 class="text-xs font-bold text-white">Direct Invite Member</h5>
                <p class="text-[11px] text-slate-400">Add an already registered user by their username or email</p>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  [(ngModel)]="directInviteInput"
                  placeholder="e.g. brother or brother@example.com"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 w-60"
                />
                <button
                  type="button"
                  (click)="directInviteUser()"
                  [disabled]="!directInviteInput"
                  class="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors"
                >
                  Add to Group
                </button>
              </div>
            </div>
          </div>
        }

        <!-- WORKSPACE MEMBERS LIST -->
        <div class="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div class="flex items-center justify-between">
            <div>
              <h4 class="text-sm font-bold text-white">Workspace Members ({{ ws.members.length }})</h4>
              <p class="text-xs text-slate-400">People with task delegation and accountability access in this workspace</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            @for (m of ws.members; track m.userId) {
              <div class="flex items-center gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-md"
                  [style.background-color]="m.avatarColor || '#2563EB'"
                >
                  {{ getInitials(m.fullName) }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-semibold text-white truncate">{{ m.fullName }}</span>
                    <span
                      class="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded"
                      [class.bg-blue-950]="m.role === 'Admin'"
                      [class.text-blue-300]="m.role === 'Admin'"
                      [class.border]="m.role === 'Admin'"
                      [class.border-blue-800]="m.role === 'Admin'"
                      [class.bg-slate-700]="m.role !== 'Admin'"
                      [class.text-slate-300]="m.role !== 'Admin'"
                    >
                      {{ m.role }}
                    </span>
                  </div>
                  <div class="text-xs text-slate-400 truncate">&#64;{{ m.username }}</div>
                  @if (m.phoneNumber) {
                    <div class="text-[10px] text-slate-500 truncate">{{ m.phoneNumber }}</div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- MODAL 1: CREATE WORKSPACE -->
      @if (showCreateModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white">Create New Workspace</h3>
              <button (click)="showCreateModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Workspace Name *</label>
              <input
                type="text"
                [(ngModel)]="newWorkspaceName"
                placeholder="e.g. Hussain Family or Hostel Flat"
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Description (Optional)</label>
              <textarea
                [(ngModel)]="newWorkspaceDesc"
                rows="2"
                placeholder="Brief description of this group..."
                class="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>
            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="showCreateModal.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="createWorkspace()"
                [disabled]="!newWorkspaceName.trim()"
                class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white"
              >
                Create Workspace
              </button>
            </div>
          </div>
        </div>
      }

      <!-- MODAL 2: JOIN WORKSPACE (CODE OR SEARCH) -->
      @if (showJoinModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white">Join a Workspace</h3>
              <button (click)="showJoinModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>

            <div class="grid grid-cols-2 p-1 bg-slate-800 rounded-xl">
              <button
                type="button"
                (click)="joinMode.set('code')"
                [class.bg-blue-600]="joinMode() === 'code'"
                [class.text-white]="joinMode() === 'code'"
                [class.text-slate-400]="joinMode() !== 'code'"
                class="py-1.5 text-xs font-semibold rounded-lg transition-colors"
              >
                Use Expiring Code
              </button>
              <button
                type="button"
                (click)="joinMode.set('search')"
                [class.bg-blue-600]="joinMode() === 'search'"
                [class.text-white]="joinMode() === 'search'"
                [class.text-slate-400]="joinMode() !== 'search'"
                class="py-1.5 text-xs font-semibold rounded-lg transition-colors"
              >
                Search Groups
              </button>
            </div>

            @if (joinMode() === 'code') {
              <div class="space-y-3 pt-1">
                <p class="text-xs text-slate-400">Enter the 6-character code given by the workspace admin:</p>
                <input
                  type="text"
                  maxlength="10"
                  [(ngModel)]="joinCodeInput"
                  placeholder="e.g. HUS786"
                  class="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm font-mono uppercase tracking-widest text-white focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  (click)="joinByCode()"
                  [disabled]="!joinCodeInput.trim()"
                  class="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-xs font-semibold text-white"
                >
                  Join Workspace Now
                </button>
              </div>
            } @else {
              <div class="space-y-3 pt-1">
                <div class="flex items-center gap-2">
                  <input
                    type="text"
                    [(ngModel)]="searchQuery"
                    (input)="onSearchInput()"
                    placeholder="Search by workspace name..."
                    class="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div class="max-h-60 overflow-y-auto space-y-2">
                  @for (res of searchResults(); track res.id) {
                    <div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                      <div>
                        <div class="text-xs font-bold text-white">{{ res.name }}</div>
                        <div class="text-[10px] text-slate-400">{{ res.memberCount }} members</div>
                      </div>

                      @if (res.isMember) {
                        <span class="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800">
                          Already Member
                        </span>
                      } @else if (res.hasPendingRequest) {
                        <span class="text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded bg-amber-950 border border-amber-800">
                          Request Pending
                        </span>
                      } @else {
                        <button
                          type="button"
                          (click)="requestToJoin(res.id)"
                          class="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
                        >
                          Request to Join
                        </button>
                      }
                    </div>
                  } @empty {
                    <div class="py-6 text-center text-xs text-slate-500">
                      Type a name above to search existing workspaces.
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- MODAL 3: GENERATE INVITE CODE -->
      @if (showCreateInviteModal()) {
        <div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div class="flex items-center justify-between">
              <h3 class="text-base font-bold text-white">Generate Invite Code</h3>
              <button (click)="showCreateInviteModal.set(false)" class="text-slate-400 hover:text-white">&times;</button>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Expiration Period</label>
              <select
                [(ngModel)]="inviteExpiryHours"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option [ngValue]="24">24 Hours (1 Day)</option>
                <option [ngValue]="72">3 Days</option>
                <option [ngValue]="168">7 Days (1 Week)</option>
                <option [ngValue]="720">30 Days</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1">Max Uses (Optional)</label>
              <input
                type="number"
                [(ngModel)]="inviteMaxUses"
                placeholder="Leave blank for unlimited"
                class="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div class="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                (click)="showCreateInviteModal.set(false)"
                class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                (click)="createInviteCode()"
                class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  readonly authService = inject(AuthService);
  private readonly workspaceService = inject(WorkspaceService);

  readonly workspaceDetail = signal<WorkspaceDetail | null>(null);
  readonly feedbackMessage = signal<string | null>(null);
  readonly errorMessage = signal<string | null>(null);

  // Modals state
  readonly showCreateModal = signal(false);
  readonly showJoinModal = signal(false);
  readonly showCreateInviteModal = signal(false);

  // Form bindings
  newWorkspaceName = '';
  newWorkspaceDesc = '';
  joinMode = signal<'code' | 'search'>('code');
  joinCodeInput = '';
  searchQuery = '';
  searchResults = signal<WorkspaceSearch[]>([]);
  inviteExpiryHours = 168; // 7 days default
  inviteMaxUses: number | null = null;
  directInviteInput = '';

  ngOnInit(): void {
    this.refreshActiveWorkspace();
  }

  refreshActiveWorkspace(): void {
    const activeWs = this.authService.activeWorkspace();
    if (activeWs) {
      this.workspaceService.getWorkspaceDetail(activeWs.id).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.workspaceDetail.set(res.data);
          }
        },
        error: (err) => {
          console.error(err);
        }
      });
    } else {
      this.workspaceDetail.set(null);
    }
  }

  createWorkspace(): void {
    if (!this.newWorkspaceName.trim()) return;

    this.workspaceService.createWorkspace({
      name: this.newWorkspaceName,
      description: this.newWorkspaceDesc
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.showCreateModal.set(false);
          this.newWorkspaceName = '';
          this.newWorkspaceDesc = '';
          this.feedbackMessage.set('Workspace created successfully!');
          this.authService.loadCurrentUser().subscribe(() => {
            this.refreshActiveWorkspace();
          });
        }
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to create workspace.');
      }
    });
  }

  joinByCode(): void {
    if (!this.joinCodeInput.trim()) return;

    this.workspaceService.joinByCode(this.joinCodeInput).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.showJoinModal.set(false);
          this.joinCodeInput = '';
          this.feedbackMessage.set('Successfully joined workspace!');
          this.authService.loadCurrentUser().subscribe(() => {
            this.refreshActiveWorkspace();
          });
        }
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Invalid or expired invite code.');
      }
    });
  }

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.searchResults.set([]);
      return;
    }

    this.workspaceService.searchWorkspaces(this.searchQuery).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.searchResults.set(res.data);
        }
      }
    });
  }

  requestToJoin(workspaceId: string): void {
    this.workspaceService.requestToJoin(workspaceId).subscribe({
      next: () => {
        this.feedbackMessage.set('Join request sent to workspace administrator.');
        this.onSearchInput();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to submit request.');
      }
    });
  }

  createInviteCode(): void {
    const ws = this.authService.activeWorkspace();
    if (!ws) return;

    this.workspaceService.createInviteCode(ws.id, this.inviteExpiryHours, this.inviteMaxUses || undefined).subscribe({
      next: () => {
        this.showCreateInviteModal.set(false);
        this.feedbackMessage.set('New invite code generated!');
        this.refreshActiveWorkspace();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Failed to generate code.');
      }
    });
  }

  revokeInvite(inviteId: string): void {
    const ws = this.authService.activeWorkspace();
    if (!ws) return;

    this.workspaceService.revokeInviteCode(ws.id, inviteId).subscribe({
      next: () => {
        this.feedbackMessage.set('Invite code revoked.');
        this.refreshActiveWorkspace();
      }
    });
  }

  respondJoinRequest(requestId: string, approve: boolean): void {
    const ws = this.authService.activeWorkspace();
    if (!ws) return;

    this.workspaceService.respondToJoinRequest(ws.id, requestId, approve).subscribe({
      next: () => {
        this.feedbackMessage.set(approve ? 'Member request approved!' : 'Member request rejected.');
        this.refreshActiveWorkspace();
      }
    });
  }

  directInviteUser(): void {
    const ws = this.authService.activeWorkspace();
    if (!ws || !this.directInviteInput.trim()) return;

    this.workspaceService.directInviteUser(ws.id, this.directInviteInput).subscribe({
      next: (res) => {
        this.directInviteInput = '';
        this.feedbackMessage.set(res.message || 'User invited and added to workspace!');
        this.refreshActiveWorkspace();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Could not add user.');
      }
    });
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.feedbackMessage.set(`Invite code "${code}" copied to clipboard!`);
      setTimeout(() => this.feedbackMessage.set(null), 3000);
    });
  }

  formatDateTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
