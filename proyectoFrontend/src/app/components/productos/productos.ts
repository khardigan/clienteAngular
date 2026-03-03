import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './productos.html',
  styleUrls: ['./productos.css'],
})
/**
 * Componente para visualizar el catálogo de productos.
 * Recupera la lista de productos desde el backend y los muestra en tarjetas.
 */
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];

  constructor(
    private productoService: ProductoService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productoService.listarProductos()
      .subscribe({
        next: (res) => {
          console.log('Productos recibidos:', res);
          this.productos = res;
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error('Error cargando productos:', err);
        }
      });
  }
}