import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto';
import { Producto } from '../../models/producto';
import { ListaDetalle } from '../../models/lista';
import { ListaService } from '../../services/lista';

@Component({
  selector: 'app-ficha-producto',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './producto.html',
  styleUrls: ['./producto.css']
})
export class FichaProductoComponent implements OnInit {

  producto: Producto | null = null;
  cargando = true;
  error = false;


  mensaje: string | null = null;
  tipoMensaje: 'success' | 'error' | null = null;
  listas: ListaDetalle[] = [];
  listaSeleccionada: ListaDetalle | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private listaService: ListaService,
    private cd: ChangeDetectorRef
  ) { }

  // Se ejecuta al cargar la ficha. Pilla el ID de la URL y busca el producto.
  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.cargarProducto(+id);
      this.cargarListas();
    } else {
      this.error = true;
      this.cargando = false;
    }
  }

  // ========================
  // PRODUCTO
  // ========================
  // Llama al servidor para traer todos los datos del producto.
  cargarProducto(id: number): void {
    this.productoService.obtenerProducto(id).subscribe({
      next: (prod) => {
        this.producto = prod;
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.error = true;
        this.cargando = false;
      }
    });
  }

  // ========================
  // LISTAS
  // ========================
  // Trae tus listas para que elijas en cuál quieres meter el producto.
  cargarListas(): void {
    this.listaService.obtenerMisListas().subscribe({
      next: (res) => {
        this.listas = res;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error cargando listas:', err)
    });
  }

  // Enseña un aviso arriba de si todo ha ido bien o ha habido un error.
  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    this.mensaje = texto;
    this.tipoMensaje = tipo;

    setTimeout(() => {
      this.mensaje = null;
      this.tipoMensaje = null;
    }, 2500);
  }
  // Cuando eliges una lista y le das al botón de añadir.
  confirmarAgregarALista(): void {
    if (!this.producto || !this.listaSeleccionada) return;

    this.agregarProductoOficialALista(this.listaSeleccionada, this.producto);
  }


  // La lógica que manda al servidor que guarde este producto en tu lista.
  agregarProductoOficialALista(lista: ListaDetalle, producto: Producto): void {

    const currentIds = lista.productos?.map(p => p.id) ?? [];

    if (currentIds.includes(producto.id)) {
      this.mostrarMensaje('El producto ya está en la lista', 'error');
      return;
    }
    const newIds = [...currentIds, producto.id];

    const usuariosIds = lista.usuariosCompartida
      ? lista.usuariosCompartida.map(u => u.id)
      : [];

    this.listaService.actualizarLista(lista.codLista, {
      productosEnLista: newIds,
      usuariosCompartida: usuariosIds
    }).subscribe({
      next: () => {
        this.mostrarMensaje('Producto añadido a la lista', 'success');

        this.listaSeleccionada = null;
        this.cargarListas();
        this.cd.detectChanges();
      },
      error: (err) => {
        console.log('ERROR COMPLETO:', err);

        this.mostrarMensaje(
          err?.error?.message || 'No se pudo añadir el producto',
          'error'
        );

        this.cd.detectChanges();
      }
    });
  }

  // ========================
  // UTIL
  // ========================
  getImagen(nombre?: string): string {
    if (!nombre) return 'https://picsum.photos/seed/default/800/600';
    return `https://picsum.photos/seed/${nombre}/800/600`;
  }

  // Te saca de la ficha y te devuelve a la tienda.
  volver(): void {
    this.router.navigate(['/productos']);
  }
}