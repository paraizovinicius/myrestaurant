import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class SignupPage {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected name = '';
  protected phone = '';
  protected password = '';
  protected confirmPassword = '';

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly success = signal<string | null>(null);
  protected showPassword = false;

  private readonly platformId = inject(PLATFORM_ID);
  protected readonly mobile = signal(false);
  private readonly destroyRef = inject(DestroyRef);
  
  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const mediaQuery = window.matchMedia('(max-width: 700px)');
    const updateMobileState = () => this.mobile.set(mediaQuery.matches);

    updateMobileState();
    mediaQuery.addEventListener('change', updateMobileState);
    this.destroyRef.onDestroy(() => mediaQuery.removeEventListener('change', updateMobileState));
  }

  async signup(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {
      if (this.password !== this.confirmPassword) {
        this.error.set('Passwords do not match.');
        return;
      }

      const data = await this.authService.signUp(
        this.email,
        this.password,
        this.name,
        this.phone
    );
      
      if (!data.session) {
        this.success.set(
            'Account created! Check your email to confirm your account.'
        );

        return;
        }

    } catch (error: any) {
      console.error('Signup failed:', error);
      this.error.set(error.message ?? 'Unable to sign up.');
    } finally {
      this.loading.set(false);
    }
  }

  
}