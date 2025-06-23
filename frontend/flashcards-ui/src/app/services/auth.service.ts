import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../models/user';
import { UserRole } from '../models/user-role';

export interface LoginRequest {
  username: string;
  password: string;
}


@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'jwt_token';
  private userSubject = new BehaviorSubject<User | null>(null);
  user$ = this.userSubject.asObservable();

  private numberToFontSize(num: number | undefined): string {
    if (num === undefined || num === null) return 'medium';
    if (num <= 14) return 'small';
    if (num >= 22) return 'large';
    return 'medium';
  }

  constructor(private http: HttpClient) {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed: User = JSON.parse(user);
      if (parsed.settings && (parsed.settings as any).flashcardFontSize !== undefined) {
        parsed.settings.fontSize = this.numberToFontSize((parsed.settings as any).flashcardFontSize);
      }
      this.userSubject.next(parsed);
    }
  }

  login(req: LoginRequest): Observable<any> {
    return this.http.post<any>(`${environment.apiBaseUrl}/users/login`, req).pipe(
      tap(res => {
        if (res.token) {
          localStorage.setItem(this.tokenKey, res.token);
          if (res.user && res.user.settings) {
            res.user.settings.fontSize = this.numberToFontSize(res.user.settings.flashcardFontSize);
          }
          localStorage.setItem('user', JSON.stringify(res.user));
          this.userSubject.next(res.user);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user');
    this.userSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): User | null {
    return this.userSubject.value;
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.roles.includes(UserRole.Admin) ?? false;
  }

  setUser(user: User | null) {
    this.userSubject.next(user);
  }
}

