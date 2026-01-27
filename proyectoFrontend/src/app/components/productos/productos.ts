import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
})




//Cambiar a futuro a MIS PRODUCTOS 
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  API = 'https://localhost:8443/productos';
  
  // Credenciales Basic temporales hasta arreglar
  private basicUser = 'admin';
  private basicPass = '1234';

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.cargarProductos();
  }


  cargarProductos(): void {
    const authHeader = 'Basic ' + btoa(`${this.basicUser}:${this.basicPass}`);
    const headers = new HttpHeaders({
      'Authorization': authHeader
    });


    this.http.get<Producto[]>(this.API, { headers })
      .subscribe({
        next: (res) => {
          console.log('Productos recibidos:', res);
          this.productos = res;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error en la petición:', err);
          if (err.status === 0) {
            console.error('Problema de SSL o CORS. Revisa si aceptaste el certificado en el navegador.');
          }
        }
      });
  }
}