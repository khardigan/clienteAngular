// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { App } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './app/services/authInterceptor';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // Enable HttpClient usage
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true } // Register interceptor globally
  ]
});
