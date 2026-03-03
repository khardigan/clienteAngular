import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    let cloned = req; // empieza con la petición original

    const token = localStorage.getItem('token');
    const isLoginOrRegister = req.url.includes('/login') || req.url.includes('/registrar');

    if (token && !isLoginOrRegister) {
      cloned = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    // --- Envía la petición al backend y captura errores ---
    return next.handle(cloned).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.warn('AuthInterceptor - 401 Unauthorized detectado. Token expirado o inválido.');
          localStorage.removeItem('token');
          localStorage.removeItem('id');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}