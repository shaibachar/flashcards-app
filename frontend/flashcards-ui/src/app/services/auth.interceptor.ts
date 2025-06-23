import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    console.log('[AuthInterceptor] Intercepting request:', req.url);
    console.log('[AuthInterceptor] Token:', token);
    if (token) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      console.log('[AuthInterceptor] Added Authorization header');
      return next.handle(cloned);
    }
    console.warn('[AuthInterceptor] No token found, sending request without Authorization header');
    return next.handle(req);
  }
}
