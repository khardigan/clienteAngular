import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

/**
 * Interceptor de Autenticación (AuthInterceptor)
 * ---------------------------------------------
 * Un Interceptor en Angular es una clase que "atrapa" todas las peticiones HTTPS
 * justo antes de que salgan de Angular hacia el servidor (backend).
 * 
 * PROPÓSITO:
 * Su trabajo es buscar el token JWT guardado en el localStorage e inyectarlo
 * automáticamente en las cabeceras (Headers) de todas las peticiones.
 * De esta forma, no tenemos que añadir el token manualmente cada vez que hacemos
 * un get() o post() a nuestra API.
 * 
 * EXCEPCIONES:
 * Si la petición es para '/login' o '/registrar', el interceptor la deja 
 * pasar sin tocar, ya que en ese momento el usuario aún no tiene un token.
 * 
 * MANEJO DE ERRORES:
 * Si el backend devuelve un error 401 (Unauthorized), significa que el token
 * ha caducado o es inválido. El interceptor lo detecta, borra la sesión 
 * y expulsa al usuario a la pantalla de login.
 */
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