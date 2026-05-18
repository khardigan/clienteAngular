import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto, ProductoPropio } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = 'https://localhost:8443/productos';
  private baseUrl2 = 'https://localhost:8443/productos-propios';

  constructor(private http: HttpClient) { }

  listarProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  listarProductosPropiosDeUsuario(usuarioId: number): Observable<ProductoPropio[]> {
    return this.http.get<ProductoPropio[]>(`${this.baseUrl2}/${usuarioId}`);
  }

  // Productos que el usuario ha subido al catálogo global (pendientes o confirmados)
  listarProductosCatalogSubidosPorUsuario(usuarioId: number): Observable<Producto[]> {
    const t = new Date().getTime();
    return this.http.get<Producto[]>(`https://localhost:8443/usuarios/${usuarioId}/productos?t=${t}`);
  }

  obtenerProductoPorId(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  crearProductoPropio(
    usuarioId: number,
    nombre: string,
    precioObjetivo?: number,
    notas?: string,
    listaId?: number | null,
    supermercado?: string,
    comprado?: boolean,
    imagenUrl?: string,
    categoria?: string
  ): Observable<ProductoPropio> {
    return this.http.post<ProductoPropio>(`${this.baseUrl2}/${usuarioId}`,
      { nombre, precioObjetivo, notas, listaId, supermercado, comprado, imagenUrl, categoria }
    );
  }

  // Actualiza los campos de un producto propio (se usa para cambiarle la lista asignada)
  actualizarProductoPropio(
    id: number,
    dto: { nombre: string; precioObjetivo?: number; notas?: string; listaId?: number | null; supermercado?: string; cantidad?: number; comprado?: boolean }
  ): Observable<ProductoPropio> {
    return this.http.put<ProductoPropio>(`${this.baseUrl2}/${id}`, dto);
  }

  buscarProductos(query: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/buscar?q=${query}`);
  }

  crearProducto(producto: { nombre: string, descripcion: string, precio: number, supermercado?: string, imagenUrl?: string, categoria?: string }): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/pending`, producto);
  }

  // Solo para administradores: elimina un producto del catálogo global
  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  eliminarProductoPropio(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl2}/${id}`);
  }

  // Permite a un administrador confirmar un producto pendiente
  confirmarProducto(id: number): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/confirm/${id}`, {});
  }

  // Obtiene los detalles de un solo producto por su ID
  obtenerProducto(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  // Obtiene la lista de categorías únicas desde la base de datos
  listarCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categorias`);
  }

  // Obtiene la lista de supermercados únicos desde la base de datos
  listarSupermercados(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/supermercados`);
  }
}
