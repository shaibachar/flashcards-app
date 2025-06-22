import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { UserRole } from '../models/user-role';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.css'],
  imports: [CommonModule, FormsModule]
})
export class UserAdminComponent implements OnInit {
  users: User[] = [];
  newUser: Partial<User> = { username: '', roles: [UserRole.User], settings: { fontSize: 'medium' } };
  newUserFontSize = 'medium';
  newUserRole: UserRole = UserRole.User;
  editingUser: User | null = null;
  editingUserRole: UserRole = UserRole.User;
  editingUserFontSize = 'medium';
  error = '';
  loading = false;

  constructor(private http: HttpClient, public auth: AuthService) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.http.get<User[]>(`${environment.apiBaseUrl}/users`).subscribe({
      next: users => this.users = users,
      error: () => this.error = 'Failed to load users.'
    });
  }

  addUser() {
    this.newUser.settings = { fontSize: this.newUserFontSize };
    this.newUser.roles = [this.newUserRole];
    this.http.post(`${environment.apiBaseUrl}/users`, this.newUser).subscribe({
      next: () => {
        this.newUser = { username: '', roles: [UserRole.User], settings: { fontSize: 'medium' } };
        this.newUserFontSize = 'medium';
        this.newUserRole = UserRole.User;
        this.loadUsers();
      },
      error: () => this.error = 'Failed to add user.'
    });
  }

  edit(user: User) {
    this.editingUser = { ...user };
    this.editingUserRole = user.roles[0] || UserRole.User;
    this.editingUserFontSize = user.settings?.fontSize || 'medium';
  }

  saveEdit() {
    if (!this.editingUser) return;
    this.editingUser.settings.fontSize = this.editingUserFontSize;
    this.editingUser.roles = [this.editingUserRole];
    this.http.put(`${environment.apiBaseUrl}/users/${this.editingUser.id}`, this.editingUser).subscribe({
      next: () => {
        this.editingUser = null;
        this.editingUserRole = UserRole.User;
        this.loadUsers();
      },
      error: () => this.error = 'Failed to update user.'
    });
  }

  deleteUser(id: string) {
    this.http.delete(`${environment.apiBaseUrl}/users/${id}`).subscribe({
      next: () => this.loadUsers(),
      error: () => this.error = 'Failed to delete user.'
    });
  }
}
