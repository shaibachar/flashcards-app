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
    console.log('Calling loadUsers');
    this.http.get<User[]>(`${environment.apiBaseUrl}/users`).subscribe({
      next: users => {
        console.log('Users loaded:', users);
        this.users = users;
      },
      error: (err) => {
        console.error('Failed to load users:', err);
        this.error = 'Failed to load users.';
      }
    });
  }

  addUser() {
    console.log('Adding user:', this.newUser);
    this.newUser.settings = { fontSize: this.newUserFontSize };
    this.newUser.roles = [this.newUserRole];
    this.http.post(`${environment.apiBaseUrl}/users`, this.newUser).subscribe({
      next: () => {
        console.log('User added successfully');
        this.newUser = { username: '', roles: [UserRole.User], settings: { fontSize: 'medium' } };
        this.newUserFontSize = 'medium';
        this.newUserRole = UserRole.User;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to add user:', err);
        this.error = 'Failed to add user.';
      }
    });
  }

  edit(user: User) {
    this.editingUser = { ...user };
    this.editingUserRole = user.roles[0] || UserRole.User;
    this.editingUserFontSize = user.settings?.fontSize || 'medium';
  }

  saveEdit() {
    if (!this.editingUser) return;
    console.log('Saving edit for user:', this.editingUser);
    this.editingUser.settings.fontSize = this.editingUserFontSize;
    this.editingUser.roles = [this.editingUserRole];
    this.http.put(`${environment.apiBaseUrl}/users/${this.editingUser.id}`, this.editingUser).subscribe({
      next: () => {
        console.log('User updated successfully');
        this.editingUser = null;
        this.editingUserRole = UserRole.User;
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to update user:', err);
        this.error = 'Failed to update user.';
      }
    });
  }

  deleteUser(id: string) {
    console.log('Deleting user with id:', id);
    this.http.delete(`${environment.apiBaseUrl}/users/${id}`).subscribe({
      next: () => {
        console.log('User deleted successfully');
        this.loadUsers();
      },
      error: (err) => {
        console.error('Failed to delete user:', err);
        this.error = 'Failed to delete user.';
      }
    });
  }
}
