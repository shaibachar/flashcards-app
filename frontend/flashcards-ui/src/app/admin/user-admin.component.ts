import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../models/user';

@Component({
  selector: 'app-user-admin',
  templateUrl: './user-admin.component.html',
  styleUrls: ['./user-admin.component.css'],
  imports: [CommonModule, FormsModule]
})
export class UserAdminComponent implements OnInit {
  users: User[] = [];
  newUser: Partial<User> = { username: '', roles: ['user'], settings: { fontSize: 'medium' } };
  editingUser: User | null = null;
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
    this.http.post(`${environment.apiBaseUrl}/users`, this.newUser).subscribe({
      next: () => {
        this.newUser = { username: '', roles: ['user'], settings: { fontSize: 'medium' } };
        this.loadUsers();
      },
      error: () => this.error = 'Failed to add user.'
    });
  }

  edit(user: User) {
    this.editingUser = { ...user };
  }

  saveEdit() {
    if (!this.editingUser) return;
    this.http.put(`${environment.apiBaseUrl}/users/${this.editingUser.id}`, this.editingUser).subscribe({
      next: () => {
        this.editingUser = null;
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
