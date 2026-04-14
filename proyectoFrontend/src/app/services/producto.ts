import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/producto';
import { AuthService } from './auth';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private baseUrl = 'https://localhost:8443/productos';

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

  buscarProductos(query: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.baseUrl}/buscar?q=${query}`);
  }

  crearProducto(producto: { nombre: string, descripcion: string, precio: number, cantidad: number }): Observable<Producto> {
    return this.http.post<Producto>(`${this.baseUrl}/pending`, producto, {
      headers: this.obtenerCabeceras()
    });
  }

  eliminarProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, {
      headers: this.obtenerCabeceras()
    });
  }
}

