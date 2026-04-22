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
        // Cache-buster para evitar que el navegador devuelva datos antiguos en navegación interna
        const t = new Date().getTime();
        return this.http.get<ListaDetalle[]>(`${this.apiUrl}/mis-listas?t=${t}`, {
            headers: this.obtenerCabeceras()
        });
    }

    eliminarDeListasPublicas(id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/despublicar`, {}, {
            headers: this.obtenerCabeceras()
        });
    }
    // Unirse a una lista compartida mediante código de invitación
    unirseALista(codigo: string): Observable<any> {
        // Ahora enviamos el código en un objeto JSON para mayor compatibilidad con el servidor (evita errores 400).
        return this.http.post(`${this.apiUrl}/unirse`, { codigo: codigo }, {
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

    // Cambiar la cantidad de un producto en la lista
    cambiarCantidadProducto(listaId: number, productoId: number, nuevaCantidad: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${listaId}/productos/${productoId}/cantidad?cantidad=${nuevaCantidad}`, {}, {
            headers: this.obtenerCabeceras()
        });
    }

    // Crear una nueva lista de la compra
    crearLista(nombre?: string): Observable<any> {
        // Crea una lista vacía con el nombre indicado o el nombre por defecto del servidor.
        return this.http.post(this.apiUrl, {
            nombre: nombre,
            productosEnLista: [],
            usuariosCompartida: []
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
    publicarLista(listaId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${listaId}/publicar`, {}, {
            headers: this.obtenerCabeceras()
        });
    }

    getListasPublicas(): Observable<ListaDetalle[]> {
        return this.http.get<ListaDetalle[]>(`${this.apiUrl}/publicas`);
    }

    copiarLista(listaId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${listaId}/copiar`, {}, {
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

    cambiarNombreLista(listaId: number, nuevoNombre: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${listaId}/nombre?nuevoNombre=${nuevoNombre}`, {}, {
            headers: this.obtenerCabeceras()
        });
    }
}
