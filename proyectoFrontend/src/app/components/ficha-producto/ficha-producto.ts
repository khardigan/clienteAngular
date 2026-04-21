import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductoService } from '../../services/producto';
import { Producto } from '../../models/producto';

@Component({
  selector: 'app-ficha-producto',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ficha-producto.html',
  styleUrls: ['./ficha-producto.css']
})
export class FichaProductoComponent implements OnInit {
  producto: Producto | null = null;
  cargando = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('FichaProductoComponent - Inicializado');
    const id = this.route.snapshot.paramMap.get('id');
    console.log('FichaProductoComponent - ID obtenido:', id);
    if (id) {
      this.cargarProducto(+id);
    } else {
      console.warn('FichaProductoComponent - No se encontró ID en la URL');
      this.error = true;
      this.cargando = false;
    }
  }

  cargarProducto(id: number): void {
    console.log('FichaProductoComponent - Cargando producto:', id);
    this.productoService.obtenerProducto(id).subscribe({
      next: (prod) => {
        console.log('FichaProductoComponent - Producto cargado:', prod);
        this.producto = prod;
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('FichaProductoComponent - Error cargando ficha del producto:', err);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  getImagen(nombre?: string): string {
    if (!nombre) return 'https://picsum.photos/seed/default/800/600';
    // Picsum es más fiable que loremflickr en algunas redes
    return `https://picsum.photos/seed/${nombre}/800/600`;
  }

  volver(): void {
    this.router.navigate(['/productos']);
  }
}
