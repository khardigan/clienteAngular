import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Guard de Administración (admin.guard)
 * -------------------------------------
 * Un Guard en Angular actúa como un "portero de seguridad" para nuestras rutas (URLs).
 * 
 * PROPÓSITO:
 * Se asigna a rutas sensibles en app.routes.ts (ej. '/usuarios' o '/administrarProductos').
 * Antes de permitir que el navegador cargue ese componente, Angular ejecuta esta función.
 * 
 * FUNCIONAMIENTO:
 * Llama al AuthService para comprobar si el rol guardado en el token del usuario es 'ADMIN'.
 * - Si devuelve `true`: Se le permite el paso y carga el componente.
 * - Si devuelve `false`: Se bloquea la navegación y se le redirige a la página principal ('/').
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  console.warn('Acceso denegado: Se requiere rol de administrador.');
  router.navigate(['/']);
  return false;
};
