import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { LoggerService } from './logger.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService, private logger: LoggerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.auth.getToken();
    this.logger.info('[AuthInterceptor] Intercepting request:', req.url);
    this.logger.info('[AuthInterceptor] Token:', token);
    if (token) {
      const cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
      this.logger.info('[AuthInterceptor] Added Authorization header');
      return next.handle(cloned);
    }
    this.logger.warn('[AuthInterceptor] No token found, sending request without Authorization header');
    return next.handle(req);
  }
}
