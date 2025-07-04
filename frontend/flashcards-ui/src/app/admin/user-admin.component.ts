import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../services/translate.pipe';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { UserRole } from '../models/user-role';
import { AddUserRequest } from '../models/add-user-request';
import { LoggerService } from '../services/logger.service';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.css'],
  imports: [CommonModule, FormsModule, TranslatePipe]
})
export class UserAdminComponent implements OnInit {
  users: User[] = [];
  newUser: Partial<User> = { username: '', roles: [UserRole.User], settings: { fontSize: 'medium' } };
  newUserPassword = '';
  newUserFontSize = 'medium';
  newUserRole: UserRole = UserRole.User;
  editingUser: User | null = null;
  editingUserRole: UserRole = UserRole.User;
  editingUserFontSize = 'medium';
  error = '';
  loading = false;

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

  constructor(private http: HttpClient, public auth: AuthService, private logger: LoggerService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.logger.info('Calling loadUsers');
    this.http.get<User[]>(`${environment.apiBaseUrl}/users`).subscribe({
      next: users => {
        this.logger.info('Users loaded:', users);
        this.users = users.map(u => ({
          ...u,
          settings: {
            ...u.settings,
            fontSize: this.numberToFontSize((u.settings as any).flashcardFontSize)
          }
        }));
      },
      error: (err) => {
        this.logger.error('Failed to load users:', err);
        this.error = 'Failed to load users.';
      }
    });
  }

  addUser() {
    this.logger.info('Adding user:', this.newUser);
    const req: AddUserRequest = {
      username: this.newUser.username ?? '',
      password: this.newUserPassword,
      roles: [this.newUserRole]
    };
    this.http.post(`${environment.apiBaseUrl}/users`, req).subscribe({
      next: () => {
        this.logger.info('User added successfully');
        this.newUser = { username: '', roles: [UserRole.User], settings: { fontSize: 'medium' } };
        this.newUserPassword = '';
        this.newUserFontSize = 'medium';
        this.newUserRole = UserRole.User;
        this.loadUsers();
      },
      error: (err) => {
        this.logger.error('Failed to add user:', err);
        this.error = 'Failed to add user.';
      }
    });
  }

  edit(user: User) {
    this.editingUser = { ...user };
    this.editingUserRole = user.roles[0] || UserRole.User;
    this.editingUserFontSize = user.settings?.fontSize ||
      this.numberToFontSize((user.settings as any).flashcardFontSize);
  }

  saveEdit() {
    if (!this.editingUser) return;
    this.logger.info('Saving edit for user:', this.editingUser);
    this.editingUser.settings.fontSize = this.editingUserFontSize;
    (this.editingUser.settings as any).flashcardFontSize =
      this.fontSizeToNumber(this.editingUserFontSize);
    this.editingUser.roles = [this.editingUserRole];
    this.http.put(`${environment.apiBaseUrl}/users/${this.editingUser.id}`, this.editingUser).subscribe({
      next: () => {
        this.logger.info('User updated successfully');
        this.editingUser = null;
        this.editingUserRole = UserRole.User;
        this.loadUsers();
      },
      error: (err) => {
        this.logger.error('Failed to update user:', err);
        this.error = 'Failed to update user.';
      }
    });
  }

  deleteUser(id: string) {
    this.logger.info('Deleting user with id:', id);
    this.http.delete(`${environment.apiBaseUrl}/users/${id}`).subscribe({
      next: () => {
        this.logger.info('User deleted successfully');
        this.loadUsers();
      },
      error: (err) => {
        this.logger.error('Failed to delete user:', err);
        this.error = 'Failed to delete user.';
      }
    });
  }
}

