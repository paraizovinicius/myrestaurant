import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

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

  protected email = '';
  protected password = '';

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly resetPassword = signal(false);
  protected readonly success = signal<string | null>(null);
  protected showPassword = false;


  async login(): Promise<void> {

    this.loading.set(true);
    this.error.set(null);

    try {

      await this.authService.signIn(
        this.email,
        this.password
      );

      await this.router.navigate(['/profile']);

    } catch (error: any) {

      console.error('Login failed:', error);

      this.error.set(
        error.message ?? 'Unable to login.'
      );

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