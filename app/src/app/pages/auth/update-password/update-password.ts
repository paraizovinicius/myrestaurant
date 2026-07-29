import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-update-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './update-password.html',
  styleUrl: './update-password.css'
})
export class UpdatePasswordPage {

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected password = '';
  protected confirmPassword = '';

  protected readonly loading = signal(false);
  protected readonly error = signal<string |null>(null);
  protected readonly success = signal<string |null>(null);
  async updatePassword() {

    if (this.password !== this.confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {

      await this.authService.updatePassword(this.password);

      await this.router.navigate(['/login']);

    } catch (err: any) {

      this.error.set(err.message);

    } finally {

      this.loading.set(false);

    }
  }


}