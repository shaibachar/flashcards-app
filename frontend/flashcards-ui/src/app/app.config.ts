import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
// import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    // Hydration is only needed for SSR. Remove or comment out to avoid NG0505 warning in CSR-only builds.
    // provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideServiceWorker('ngsw-worker.js')
  ]
};
