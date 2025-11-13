import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

// Example: If the old codebase exposes a legacy NgModule you must use
// import { SharedModule } from 'projects/legacy/shared/shared.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),                 // replaces BrowserAnimationsModule
    provideZoneChangeDetection({ eventCoalescing: true }),

    // If you need DI providers from a legacy NgModule:
    // importProvidersFrom(SharedModule),
  ]
};