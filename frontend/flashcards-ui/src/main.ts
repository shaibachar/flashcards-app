import { bootstrapApplication } from '@angular/platform-browser';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

console.log('[main.ts] Starting application bootstrap');

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [...(appConfig.providers || []), provideIonicAngular()],
})
  .then((appRef) => {
    console.log('[main.ts] Application bootstrapped successfully', appRef);
  })
  .catch((err) => console.error('[main.ts] Bootstrap failed', err));
