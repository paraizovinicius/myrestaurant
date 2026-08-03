import { Component, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginPage {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected password = '';

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly resetPassword = signal(false);
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


  async login(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      await this.authService.signIn(this.email, this.password);

      // Get returnUrl from query params, defaulting to '/' if not present
      const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
      
      await this.router.navigateByUrl(returnUrl);

    } catch (error: any) {
      console.error('Login failed:', error);
      this.error.set(error.message ?? 'Unable to login.');
    } finally {
      this.loading.set(false);
    }
  }

  async sendResetPassword(): Promise<void> {

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    try {

        await this.authService.resetPassword(this.email);

        this.success.set(
        'If an account exists for this email, a password reset link has been sent.'
        );

    } catch (error: any) {

        this.error.set(
        error.message ?? 'Unable to send reset email.'
        );

    } finally {

        this.loading.set(false);

    }
    }

}