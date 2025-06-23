import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  menuOpen = false;
  constructor(public auth: AuthService, private router: Router) {}

  get userAvatarUrl(): string {
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

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
    this.closeMenu();
  }
}
