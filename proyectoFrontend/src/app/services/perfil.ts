import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Perfil {
  id: number;
  usuarioId: number;
  bio: string;
  foto?: string;
  twitter?: string;
  instagram?: string;
}

@Injectable({
  providedIn: 'root' // Esto hace que Angular lo pueda inyectar en cualquier componente
})
export class PerfilService {
  private API = 'http://localhost:8080/perfiles';

  constructor(private http: HttpClient) {}

  obtenerPerfil(usuarioId: number): Observable<Perfil> {
    const token = localStorage.getItem('token') || '';
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return this.http.get<Perfil>(`${this.API}/${usuarioId}`, { headers });
  }
}