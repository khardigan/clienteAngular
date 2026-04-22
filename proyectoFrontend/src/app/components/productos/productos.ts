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
// Componente para visualizar el catálogo de productos.
// Recupera la lista de productos desde el backend y los muestra en tarjetas.
export class ProductosComponent implements OnInit {
  productos: Producto[] = [];
  mostrarFormulario = false;
  mensajeExito = '';

  // Filtros
  searchQuery = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;

  nuevoNombre = '';
  nuevaDescripcion = '';
  nuevoPrecio: number | null = null;
  nuevaCantidad: number = 1;
  nuevoSupermercado = ''; // Nuevo campo

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



  toggleFormulario(): void {
    this.mostrarFormulario = !this.mostrarFormulario;
  }

  crearProducto(): void {
    if (!this.nuevoNombre || !this.nuevaDescripcion || !this.nuevoPrecio) return;

    this.productoService.crearProducto({
      nombre: this.nuevoNombre,
      descripcion: this.nuevaDescripcion,
      precio: this.nuevoPrecio,
      cantidad: this.nuevaCantidad,
      supermercado: this.nuevoSupermercado || undefined
    }).subscribe({
      next: (producto) => {
        this.productos.push(producto);
        this.nuevoNombre = '';
        this.nuevaDescripcion = '';
        this.nuevoPrecio = null;
        this.nuevaCantidad = 1;
        this.nuevoSupermercado = '';
        this.mostrarFormulario = false;

        // Mostrar mensaje de éxito
        this.mensajeExito = '✓ Producto creado correctamente. Espera a que sea confirmado por un administrador.';
        setTimeout(() => {
          this.mensajeExito = '';
        }, 5000);

        this.cd.detectChanges();
      },
      error: (err) => console.error('Error al crear producto:', err)
    });
  }


}
