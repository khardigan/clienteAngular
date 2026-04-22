import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, ProductoPropio } from '../models/producto';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = 'https://localhost:8443/productos';
  private baseUrl2 = 'https://localhost:8443/productos-propios';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private obtenerCabeceras(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  listarProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  listarProductosPropiosDeUsuario(usuarioId: number): Observable<ProductoPropio[]> {
    return this.http.get<ProductoPropio[]>(`${this.baseUrl2}/${usuarioId}`, {
      headers: this.obtenerCabeceras()
    });
  }

  // Productos que el usuario ha subido al catálogo global (pendientes o confirmados)
  listarProductosCatalogSubidosPorUsuario(usuarioId: number): Observable<Producto[]> {
    const t = new Date().getTime();
    return this.http.get<Producto[]>(`https://localhost:8443/usuarios/${usuarioId}/productos?t=${t}`, {
      headers: this.obtenerCabeceras()
    });
  }

  crearProductoPropio(
    usuarioId: number,
    nombre: string,
    precioObjetivo?: number,
    notas?: string,
    listaId?: number | null,
    supermercado?: string,
    cantidad?: number,
    comprado?: boolean
  ): Observable<ProductoPropio> {
    return this.http.post<ProductoPropio>(`${this.baseUrl2}/${usuarioId}`,
      { nombre, precioObjetivo, notas, listaId, supermercado, cantidad, comprado },
      { headers: this.obtenerCabeceras() }
    );
  }

  // Actualiza los campos de un producto propio (se usa para cambiarle la lista asignada)
  actualizarProductoPropio(
    id: number,
    dto: { nombre: string; precioObjetivo?: number; notas?: string; listaId?: number | null; supermercado?: string; cantidad?: number; comprado?: boolean }
  ): Observable<ProductoPropio> {
    return this.http.put<ProductoPropio>(`${this.baseUrl2}/${id}`, dto, {
      headers: this.obtenerCabeceras()
    });
  }

  buscarProductos(query: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/buscar?q=${query}`);
  }

  crearProducto(producto: { nombre: string, descripcion: string, precio: number, cantidad: number, supermercado?: string }): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/pending`, producto, {
      headers: this.obtenerCabeceras()
    });
  }

  // Solo para administradores: elimina un producto del catálogo global
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.obtenerCabeceras()
    });
  }

  eliminarProductoPropio(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl2}/${id}`, {
      headers: this.obtenerCabeceras()
    });
  }

  // Permite a un administrador confirmar un producto pendiente
  confirmarProducto(id: number): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/confirm/${id}`, {}, {
      headers: this.obtenerCabeceras()
    });
  }

  // Obtiene los detalles de un solo producto por su ID
  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }
}

