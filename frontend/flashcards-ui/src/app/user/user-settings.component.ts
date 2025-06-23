import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User, UserSettings } from '../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.css'],
  imports: [CommonModule, FormsModule]
})
export class UserSettingsComponent {
  user: User | null;
  fontSize: string = 'medium';
  message = '';
  error = '';

  private numberToFontSize(num: number | undefined): string {
    if (num === undefined || num === null) return 'medium';
    if (num <= 14) return 'small';
    if (num >= 22) return 'large';
    return 'medium';
  }

  private fontSizeToNumber(size: string): number {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 24;
      default:
        return 18;
    }
  }

  constructor(private auth: AuthService, private http: HttpClient) {
    this.user = this.auth.getCurrentUser();
    const num = this.user?.settings?.flashcardFontSize;
    this.fontSize = this.user?.settings?.fontSize || this.numberToFontSize(num);
  }

  save() {
    if (!this.user) return;
    const settings: UserSettings = {
      flashcardFontSize: this.fontSizeToNumber(this.fontSize),
      fontSize: this.fontSize
    };
    const updated: User = {
      id: this.user.id,
      username: this.user.username,
      roles: this.user.roles,
      settings
    };
    this.http.put(`${environment.apiBaseUrl}/users/${this.user.id}/settings`, settings).subscribe({
      next: () => {
        this.message = 'Settings saved!';
        this.error = '';
        // Update local user
        localStorage.setItem('user', JSON.stringify(updated));
        this.auth.setUser(updated);
      },
      error: () => {
        this.error = 'Failed to save settings.';
        this.message = '';
      }
    });
  }
}
