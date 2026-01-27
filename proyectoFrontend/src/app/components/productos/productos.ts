// src/app/components/productos/productos.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-productos',
  standalone: true,         // necesario
  imports: [CommonModule, FormsModule, HttpClientModule],   // para *ngFor, *ngIf y HttpClient
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
})
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  API = 'https://localhost:8443/productos';
  basicUser = 'admin';
  basicPass = '1234';

  constructor(private http: HttpClient, private cd: ChangeDetectorRef) { }

  ngOnInit(): void {
    // Creamos header Basic Auth
    const headers = new HttpHeaders({
      'Authorization': 'Basic ' + btoa(this.basicUser + ':' + this.basicPass)
    });

    this.http.get<Producto[]>(this.API, { headers })
      .subscribe({
        next: res => {
          // Asignamos la respuesta directamente
          this.productos = res;
          this.cd.detectChanges();
        },
        error: err => console.error('Error al obtener productos:', err)
      });
  }
}
