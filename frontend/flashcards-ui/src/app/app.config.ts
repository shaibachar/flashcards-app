import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideIonicAngular } from '@ionic/angular/standalone';
// import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';
import { AuthInterceptor } from './services/auth.interceptor';
import { LoadingInterceptor } from './services/loading.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideIonicAngular(),
    // Hydration is only needed for SSR. Remove or comment out to avoid NG0505 warning in CSR-only builds.
    // provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js'),
    // AuthInterceptor is provided here to ensure it is available for all HTTP requests
    // This is necessary for the AuthService to add the Authorization header to requests.
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
  ]
};
