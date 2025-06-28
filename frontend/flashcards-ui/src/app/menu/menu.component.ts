import { IonicModule } from '@ionic/angular/standalone';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TranslatePipe } from '../services/translate.pipe';
import { TranslationService } from '../services/translation.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, TranslatePipe],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  menuOpen = false;
  constructor(
    public auth: AuthService,
    private router: Router,
    public i18n: TranslationService
  ) {}

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

  toggleLang() {
    this.i18n.toggle();
  }
}
