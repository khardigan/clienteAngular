import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ListaDetalle } from '../models/lista';

@Injectable({
    providedIn: 'root'
})
export class ListaService {
    private apiUrl = 'https://localhost:8443/listas';

    constructor(private http: HttpClient) { }

    // Obtener las listas detalladas del usuario actual (mis-listas)
    obtenerMisListas(): Observable<ListaDetalle[]> {
        const t = new Date().getTime();
        return this.http.get<ListaDetalle[]>(`${this.apiUrl}/mis-listas?t=${t}`);
    }

    eliminarDeListasPublicas(id: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${id}/despublicar`, {});
    }

    // Unirse a una lista compartida mediante código de invitación
    unirseALista(codigo: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/unirse`, { codigo: codigo });
    }

    // Cambiar el estado 'comprado' de un producto en la lista
    cambiarEstadoComprado(listaId: number, productoId: number, estado: boolean): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${listaId}/productos/${productoId}/comprado?estado=${estado}`, {});
    }

    // Cambiar la cantidad de un producto en la lista
    cambiarCantidadProducto(listaId: number, productoId: number, nuevaCantidad: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${listaId}/productos/${productoId}/cantidad?cantidad=${nuevaCantidad}`, {});
    }

    // Crear una nueva lista de la compra
    crearLista(nombre?: string): Observable<any> {
        return this.http.post(this.apiUrl, {
            nombre: nombre,
            productosEnLista: [],
            usuariosCompartida: []
        });
    }

    // Eliminar una lista
    eliminarLista(listaId: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${listaId}`);
    }

    publicarLista(listaId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${listaId}/publicar`, {});
    }

    getListasPublicas(): Observable<ListaDetalle[]> {
        return this.http.get<ListaDetalle[]>(`${this.apiUrl}/publicas`);
    }

    copiarLista(listaId: number): Observable<any> {
        return this.http.post(`${this.apiUrl}/${listaId}/copiar`, {});
    }

    // Actualizar una lista (por ejemplo para añadir productos)
    actualizarLista(id: number, request: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, request);
    }

    // Obtener el total de una lista
    obtenerTotalLista(listaId: number): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/${listaId}/total`);
    }

    cambiarNombreLista(listaId: number, nuevoNombre: string): Observable<any> {
        return this.http.patch(`${this.apiUrl}/${listaId}/nombre?nuevoNombre=${nuevoNombre}`, {});
    }
}
