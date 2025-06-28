import { IonicModule } from '@ionic/angular';
import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationStart, NavigationEnd, NavigationError } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './services/auth.service';
import { MenuComponent } from './menu/menu.component';
import { LoadingSpinnerComponent } from './loading-spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonicModule, RouterOutlet, MenuComponent, LoadingSpinnerComponent, NgIf],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'flashcards-ui';
  menuOpen = false;
  showFallback = false;
  lastError: string | null = null;

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

  onRouteActivate(event: any) {
    this.showFallback = false;
    this.lastError = null;
    console.log('[AppComponent] Activated route:', event);
  }

  onRouteDeactivate(event: any) {
    console.log('[AppComponent] Deactivated route:', event);
  }

  ngOnInit() {
    console.log('[AppComponent] ngOnInit');
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        console.log('[AppComponent] NavigationStart:', event.url);
      } else if (event instanceof NavigationEnd) {
        console.log('[AppComponent] NavigationEnd:', event.url);
      } else if (event instanceof NavigationError) {
        console.error('[AppComponent] NavigationError:', event.error);
      }
    });
    window.addEventListener('error', (e: any) => {
      this.showFallback = true;
      this.lastError = e.message || 'Unknown error';
      console.error('[AppComponent] Global error:', e);
    });
    window.addEventListener('unhandledrejection', (e: any) => {
      this.showFallback = true;
      this.lastError = e.reason?.message || 'Unhandled promise rejection';
      console.error('[AppComponent] Unhandled rejection:', e);
    });
  }
}
