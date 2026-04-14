import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';

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
  mostrarFormulario = false;

  nuevoNombre = '';
  nuevaDescripcion = '';
  nuevoPrecio: number | null = null;
  nuevaCantidad: number = 1;

  constructor(
    private productoService: ProductoService,
    private authService: AuthService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  cargarProductos(): void {
    this.productoService.listarProductos()
      .subscribe({
        next: (res) => {
          this.productos = res;
          this.cd.detectChanges();
        },
        error: (err) => console.error('Error cargando productos:', err)
      });
  }

  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  crearProducto(): void {
    if (!this.nuevoNombre || !this.nuevaDescripcion || !this.nuevoPrecio) return;

    this.productoService.crearProducto({
      nombre: this.nuevoNombre,
      descripcion: this.nuevaDescripcion,
      precio: this.nuevoPrecio,
      cantidad: this.nuevaCantidad
    }).subscribe({
      next: (producto) => {
        this.productos.push(producto);
        this.nuevoNombre = '';
        this.nuevaDescripcion = '';
        this.nuevoPrecio = null;
        this.nuevaCantidad = 1;
        this.mostrarFormulario = false;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al crear producto:', err)
    });
  }

  eliminarProducto(id: number): void {
    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== id);
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al eliminar producto:', err)
    });
  }
}
