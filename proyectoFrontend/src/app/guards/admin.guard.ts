import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

/**
 * Guard para proteger rutas administrativas.
 * Solo permite el acceso si el usuario tiene el rol de ADMIN.
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAdmin()) {
    return true;
  }

  // Si no es admin, redirigir a la página de inicio
  console.warn('Acceso denegado: Se requiere rol de administrador.');
  router.navigate(['/']);
  return false;
};
