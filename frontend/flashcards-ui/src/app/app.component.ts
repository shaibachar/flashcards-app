import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';
import { MenuComponent } from './menu/menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'flashcards-ui';
  menuOpen = false;
  constructor(public auth: AuthService, private router: Router) {}

  get userAvatarUrl(): string {
    // You can extend this to use a user profile image if available
    return 'assets/icons/user-avatar.png';
  }

  onUserIconClick() {
    if (this.auth.getCurrentUser()) {
      this.router.navigate(['/settings']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu() {
    this.menuOpen = false;
  }
}
