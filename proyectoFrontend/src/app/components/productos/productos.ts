import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Producto } from '../../models/producto';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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

  // Filtros
  searchQuery = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

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

  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Lógica de filtrado y visibilidad
  get productosFiltrados(): Producto[] {
    const query = this.searchQuery ? this.searchQuery.trim().toLowerCase() : '';

    return this.productos.filter(p => {
      // Los usuarios normales solo ven productos confirmados
      if (!this.isAdmin && !p.confirmado) return false;

      // Si el buscador está vacío (o solo espacios), permitimos todos
      const matchesSearch = !query ||
        p.nombre.toLowerCase().includes(query) ||
        p.descripcion.toLowerCase().includes(query);

      const matchesMinPrice = this.minPrice === null || p.precio >= this.minPrice;
      const matchesMaxPrice = this.maxPrice === null || p.precio <= this.maxPrice;

      return matchesSearch && matchesMinPrice && matchesMaxPrice;
    }).sort((a, b) => a.precio - b.precio);
  }

  // Genera una URL de imagen dinámica basada en el nombre del producto
  getImagenProducto(nombre: string): string {
    if (!nombre) return 'https://picsum.photos/seed/default/400/300';
    // Picsum es más estable que loremflickr
    return `https://picsum.photos/seed/${nombre}/400/300`;
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

  confirmarProducto(id: number): void {
    this.productoService.confirmarProducto(id).subscribe({
      next: (actualizado) => {
        const index = this.productos.findIndex(p => p.id === id);
        if (index !== -1) {
          this.productos[index] = actualizado;
          this.cd.detectChanges();
        }
      },
      error: (err) => console.error('Error confirmando producto:', err)
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
    if (!confirm('¿Seguro que quieres eliminar este producto?')) return;

    this.productoService.eliminarProducto(id).subscribe({
      next: () => {
        this.productos = this.productos.filter(p => p.id !== id);
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al eliminar producto:', err)
    });
  }
}
