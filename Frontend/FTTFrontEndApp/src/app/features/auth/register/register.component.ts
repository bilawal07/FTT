import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-8 text-slate-100">
      <!-- Brand Header -->
      <div class="mb-6 text-center">
        <h1 class="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
          Create an Account
        </h1>
        <p class="text-sm text-slate-400 mt-1">Join Family Task Tracker to collaborate across multiple workspaces</p>
      </div>

      <!-- Registration Card -->
      <div class="w-full max-w-lg bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
        <!-- Error Message Banner -->
        @if (authService.errorMessage()) {
          <div class="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-800/80 text-red-300 text-xs flex items-start gap-2.5">
            <svg class="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ authService.errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Full Name -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Full Name *</label>
            <input
              type="text"
              formControlName="fullName"
              placeholder="e.g. Bilawal Hussain"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            @if (registerForm.get('fullName')?.touched && registerForm.get('fullName')?.invalid) {
              <p class="text-[11px] text-red-400 mt-1">Full name is required</p>
            }
          </div>

          <!-- Username & Email (Grid) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Username *</label>
              <input
                type="text"
                formControlName="username"
                placeholder="e.g. bilawal"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              @if (registerForm.get('username')?.touched && registerForm.get('username')?.invalid) {
                <p class="text-[11px] text-red-400 mt-1">Username is required (min 3 chars)</p>
              }
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">Email Address *</label>
              <input
                type="email"
                formControlName="email"
                placeholder="e.g. bilawal@example.com"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
              @if (registerForm.get('email')?.touched && registerForm.get('email')?.invalid) {
                <p class="text-[11px] text-red-400 mt-1">Valid email is required</p>
              }
            </div>
          </div>

          <!-- Phone Number & Address (Optional) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number <span class="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="tel"
                formControlName="phoneNumber"
                placeholder="e.g. +92 300 1234567"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-300 mb-1.5">
                Address / City <span class="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                formControlName="address"
                placeholder="e.g. Lahore, Pakistan"
                class="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <!-- Password -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1.5">Password *</label>
            <input
              type="password"
              formControlName="password"
              placeholder="At least 6 characters"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            />
            @if (registerForm.get('password')?.touched && registerForm.get('password')?.invalid) {
              <p class="text-[11px] text-red-400 mt-1">Password must be at least 6 characters</p>
            }
          </div>

          <!-- Avatar Color Selection -->
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-2">Avatar Profile Color</label>
            <div class="flex items-center gap-3">
              @for (color of avatarColors; track color) {
                <button
                  type="button"
                  (click)="selectColor(color)"
                  [style.background-color]="color"
                  [class.ring-2]="selectedColor() === color"
                  [class.ring-offset-2]="selectedColor() === color"
                  [class.ring-offset-slate-900]="selectedColor() === color"
                  [class.ring-white]="selectedColor() === color"
                  class="w-8 h-8 rounded-full transition-transform active:scale-90 shadow-sm"
                ></button>
              }
            </div>
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            [disabled]="registerForm.invalid || authService.isLoading()"
            class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 mt-4"
          >
            @if (authService.isLoading()) {
              <svg class="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Creating your account...</span>
            } @else {
              <span>Complete Registration</span>
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            }
          </button>
        </form>

        <!-- Back to Login -->
        <div class="mt-6 text-center">
          <p class="text-xs text-slate-400">
            Already have an account?
            <a routerLink="/login" class="text-blue-400 hover:text-blue-300 font-semibold underline underline-offset-4 ml-1">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  `
})
export class RegisterComponent {
  readonly authService = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  readonly selectedColor = signal<string>('#2563EB');

  readonly avatarColors = [
    '#2563EB', // Blue
    '#16A34A', // Green
    '#9333EA', // Purple
    '#EA580C', // Orange
    '#E11D48', // Pink
    '#0D9488'  // Teal
  ];

  readonly registerForm: FormGroup = this.fb.group({
    fullName: ['', [Validators.required]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: [''],
    address: [''],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  selectColor(color: string): void {
    this.selectedColor.set(color);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const formVal = this.registerForm.value;
    this.authService.register({
      fullName: formVal.fullName,
      username: formVal.username,
      email: formVal.email,
      phoneNumber: formVal.phoneNumber,
      address: formVal.address,
      password: formVal.password,
      avatarColor: this.selectedColor()
    }).subscribe();
  }
}
