import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
     * OBTENER TODOS LOS COMENTARIOS GLOBALES
     */
    getTodosLosComentarios(): Observable<Comentario[]> {
        return this.http.get<Comentario[]>(`${this.baseUrl}/todos`);
    }

    /**
     * OBTENER SÓLO MIS COMENTARIOS
     */
    getMisComentarios(): Observable<Comentario[]> {
        const miId = this.authService.getId();
        if (!miId) {
            throw new Error('No hay sesión iniciada');
        }
        return this.http.get<Comentario[]>(`${this.baseUrl}/mis-comentarios/${miId}`);
    }

    obtenerComentariosProducto(idProducto: number): Observable<Comentario[]> {
        return this.http.get<Comentario[]>(`${this.baseUrl}/producto/${idProducto}`);
    }

    eliminarComentario(id: number): Observable<Comentario> {
        const idUser = this.authService.getId();
        if (!idUser) {
            throw new Error('No hay sesión iniciada');
        }
        return this.http.delete<Comentario>(`${this.baseUrl}/eliminar/${id}`);
    }

    actualizarComentario(id: number, contenido: string, puntuacion: any): Observable<Comentario> {
        const idUser = this.authService.getId();
        if (!idUser) {
            throw new Error('No hay sesión iniciada');
        }
        return this.http.put<Comentario>(`${this.baseUrl}/actualizar/${id}`, { contenido, puntuacion });
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

        return this.http.post(`${this.baseUrl}/crear`, body);
    }
}