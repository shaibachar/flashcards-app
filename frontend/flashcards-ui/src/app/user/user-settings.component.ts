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

  constructor(private auth: AuthService, private http: HttpClient) {
    this.user = this.auth.getCurrentUser();
    this.fontSize = this.user?.settings?.fontSize || 'medium';
  }

  save() {
    if (!this.user) return;
    const settings: UserSettings = { fontSize: this.fontSize };
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
