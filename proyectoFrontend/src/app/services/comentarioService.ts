import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // Importa HttpHeaders
import { Observable } from 'rxjs';
import { AuthService } from './auth';
import { Comentario } from '../models/comentario';

@Injectable({
    providedIn: 'root'
})
export class ComentarioService {

    private baseUrl = 'https://localhost:8443/comentarios';
    constructor(private http: HttpClient, private authService: AuthService) { }

    /**
     * Crea las cabeceras con el token JWT
     */
    private getHeaders(): HttpHeaders {
        const token = this.authService.getToken();
        let headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return headers;
    }

    /**
     * FUNCIÓN 1: OBTENER TODOS LOS COMENTARIOS GLOBALES
     */
    getTodosLosComentarios(): Observable<Comentario[]> {
        // Pasamos las cabeceras como segundo argumento
        return this.http.get<Comentario[]>(`${this.baseUrl}/todos`, { headers: this.getHeaders() });
    }

    /**
     * FUNCIÓN 2: OBTENER SÓLO MIS COMENTARIOS
     */
    getMisComentarios(): Observable<Comentario[]> {
        const miId = this.authService.getId();
        if (!miId) {
            throw new Error('No hay sesión iniciada');
        }
        // Pasamos las cabeceras también aquí
        return this.http.get<Comentario[]>(`${this.baseUrl}/mis-comentarios/${miId}`, { headers: this.getHeaders() });
    }

    obtenerComentariosProducto(idProducto: number): Observable<Comentario[]> {
        return this.http.get<Comentario[]>(`${this.baseUrl}/producto/${idProducto}`, { headers: this.getHeaders() });
    }

    eliminarComentario(id: number): Observable<Comentario> {
        const idUser = this.authService.getId();
        if (!idUser) {
            throw new Error('No hay sesión iniciada');
        }
        return this.http.delete<Comentario>(`${this.baseUrl}/eliminar/${id}`, { headers: this.getHeaders() });
    }

    actualizarComentario(id: number, contenido: string, puntuacion: any): Observable<Comentario> {
        const idUser = this.authService.getId();
        if (!idUser) {
            throw new Error('No hay sesión iniciada');
        }
        return this.http.put<Comentario>(`${this.baseUrl}/actualizar/${id}`, { contenido, puntuacion }, { headers: this.getHeaders() });
    }
    crearComentario(idProducto: number, contenido: string, puntuacion: number): Observable<any> {
        const idUsuario = this.authService.getId();
        if (!idUsuario) {
            throw new Error('No hay sesión iniciada');
        }

        const body = {
            contenido: contenido,
            puntuacion: puntuacion,
            idUsuario: idUsuario,
            idProducto: idProducto
        };

        return this.http.post(`${this.baseUrl}/crear`, body, { headers: this.getHeaders() });
    }
}   