import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = 'https://localhost:8443/productos';

  constructor(private http: HttpClient) { }

  listarProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  buscarProductos(query: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/buscar?q=${query}`);
  }

  crearProductoTemporal(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, producto);
  }

  confirmarProducto(tempId: number): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/confirmar/${tempId}`, {});
  }
}
