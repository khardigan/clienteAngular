import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListaDetalle } from '../models/lista';
import { AuthService } from './auth';

@Injectable({
    providedIn: 'root'
})
export class ListaService {
    private apiUrl = 'https://localhost:8443/listas';

    constructor(
        private http: HttpClient,
        private authService: AuthService
    ) { }

    private obtenerCabeceras(): HttpHeaders {
        // Genera las cabeceras HTTP inyectando el token JWT del usuario para que el servidor nos identifique.
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // Obtener las listas detalladas del usuario actual (mis-listas)
    obtenerMisListas(): Observable<ListaDetalle[]> {
        // Llama al servidor para descargar las listas de la compra donde el usuario es dueño o invitado.
        return this.http.get<ListaDetalle[]>(`${this.apiUrl}/mis-listas`, {
            headers: this.obtenerCabeceras()
        });
    }

    // Cambiar el estado 'comprado' de un producto en la lista
    cambiarEstadoComprado(listaId: number, productoId: number, estado: boolean): Observable<any> {
        // Envía una petición PATCH al servidor para cambiar el estado de un producto (de Pendiente a Comprado o viceversa).
        return this.http.patch(`${this.apiUrl}/${listaId}/productos/${productoId}/comprado?estado=${estado}`, {}, {
            headers: this.obtenerCabeceras()
        });
    }

    // Crear una nueva lista con productos seleccionados
    crearLista(productosIds: number[], usuariosIds: number[] = []): Observable<any> {
        return this.http.post(this.apiUrl, {
            productosEnLista: productosIds,
            usuariosCompartida: usuariosIds
        }, {
            headers: this.obtenerCabeceras()
        });
    }

    // Eliminar una lista
    eliminarLista(listaId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${listaId}`, {
            headers: this.obtenerCabeceras()
        });
    }

    // Actualizar una lista (por ejemplo para añadir productos)
    actualizarLista(id: number, request: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, request, {
            headers: this.obtenerCabeceras()
        });
    }

    // Obtener el total de una lista
    obtenerTotalLista(listaId: number): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/${listaId}/total`, {
            headers: this.obtenerCabeceras()
        });
    }
}
