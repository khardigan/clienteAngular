import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface Perfil {
  id: number;
  usuarioId: number;
  bio: string;
  foto?: string;
  twitter?: string;
  instagram?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private API = 'https://localhost:8443/perfiles';

  constructor(private http: HttpClient) { }

  obtenerPerfilDesdeToken(): Observable<Perfil> {
    const token = localStorage.getItem('token') || '';

    console.log("PerfilService - Token sacado de localStorage:", token);

    // ... further down inside obtenerPerfilDesdeToken:
    if (!token || token.split('.').length !== 3) {
      console.warn("PerfilService - No hay token válido en localStorage");
      return throwError(() => new Error('No valid token found'));
    }

    let usuarioId;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      usuarioId = payload.id;
    } catch (e) {
      console.error("PerfilService - Error parseando token:", e);
      return throwError(() => new Error('Invalid token format'));
    }

    console.log("PerfilService - ID obtenido del token:", usuarioId);
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    console.log("PerfilService - Haciendo GET a:", `https://localhost:8443/usuarios/${usuarioId}/perfil`);

    // Cambiado: Ahora apuntamos al endpoint de usuario que obtiene su propio perfil
    return this.http.get<Perfil>(`https://localhost:8443/usuarios/${usuarioId}/perfil`, { headers });
  }
}