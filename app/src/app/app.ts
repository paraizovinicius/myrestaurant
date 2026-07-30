import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../app/core/services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('MyRestaurant');
  protected readonly currentYear = new Date().getFullYear();
  private readonly authService = inject(AuthService);

  protected readonly user = this.authService.user;

  protected readonly isLoggedIn = computed(() => !!this.user());
}
