import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';

export interface Perfil {
  idPerfil: number;
  usuarioId: number;
  nombrePerfil: string;
  descripcion: string;
  subtitulo?: string;
  fechaNacimiento?: string;
  edad?: string;
  residencia?: string;
  email?: string;
  telefono?: string;
  imagenUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PerfilService {

  private API = 'https://localhost:8443/perfiles';
  //esto es un emisor de eventos para que el nav se actualice con el cambio de foto del perfil y el subtitulo
  private perfilActualizadoSource = new Subject<void>();
  perfilActualizado$ = this.perfilActualizadoSource.asObservable();

  notificarCambioPerfil() {
    this.perfilActualizadoSource.next();
  }

  constructor(private http: HttpClient) { }

  obtenerPerfilDesdeToken(): Observable<Perfil> {
    const token = localStorage.getItem('token') || '';


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

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });


    // Cambiado: Ahora apuntamos al endpoint de usuario que obtiene su propio perfil
    return this.http.get<Perfil>(`https://localhost:8443/usuarios/${usuarioId}/perfil`, { headers });
  }

  // Manda los datos del perfil actualizados al servidor.
  actualizarPerfil(id: number, datos: Partial<Perfil>): Observable<Perfil> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
    return this.http.put<Perfil>(`${this.API}/${id}`, datos, { headers });
  }
}