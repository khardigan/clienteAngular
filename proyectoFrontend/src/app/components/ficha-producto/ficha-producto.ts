import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../services/producto';
import { Producto } from '../../models/producto';
import { ListaDetalle } from '../../models/lista';
import { ListaService } from '../../services/lista';
import { ComentarioService } from '../../services/comentarioService';
import { Comentario } from '../../models/comentario';
import { AuthService } from '../../services/auth';
import { MensajeService } from '../../services/mensaje';

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


  listas: ListaDetalle[] = [];
  listaSeleccionada: ListaDetalle | null = null;
  nuevoComentario: string = '';
  nuevaPuntuacion: number = 0;
  comentarioEditando: Comentario | null = null;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productoService: ProductoService,
    private comentarioService: ComentarioService,
    private listaService: ListaService,
    public authService: AuthService,
    public mensajeService: MensajeService,
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

  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    if (tipo === 'success') {
      this.mensajeService.mostrarSuccess(texto);
    } else {
      this.mensajeService.mostrarError(texto);
    }
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

  // Ahora devuelve directamente el valor numérico que procesamos en cargarProducto
  getMediaPuntuacion(): number {
    return this.producto?.mediaPuntuacion || 0;
  }

  cargarProducto(id: number): void {
    this.productoService.obtenerProducto(id).subscribe({
      next: (prod) => {
        this.producto = prod;
        this.producto.mediaPuntuacion = prod.mediaPuntuacion || 0;
        this.producto.comentarios = [];
        this.obtenerComentariosProducto();
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando producto:', err);
        this.error = true;
        this.cargando = false;
      }
    });
  }

  getMediaEstrellas(): string {
    const media = this.getMediaPuntuacion();

    if (media <= 0) return '';

    const estrellasEnteras = Math.floor(media);
    const tieneMediaEstrella = (media - estrellasEnteras) >= 0.5;
    let estrellasHTML = '';

    for (let i = 0; i < estrellasEnteras; i++) {
      estrellasHTML += '<i class="bi bi-star-fill"></i> ';
    }
    if (tieneMediaEstrella) {
      estrellasHTML += '<i class="bi bi-star-half"></i> ';
    }
    for (let i = estrellasEnteras + (tieneMediaEstrella ? 1 : 0); i < 5; i++) {
      estrellasHTML += '<i class="bi bi-star"></i> ';
    }

    console.log('4. HTML resultante:', estrellasHTML);
    return estrellasHTML.trim();
  }
  // Te saca de la ficha y te devuelve a la tienda.
  volver(): void {
    this.router.navigate(['/productos']);
  }

  // Para marcar las estrellas en el formulario
  setRating(valor: number): void {
    this.nuevaPuntuacion = valor;
  }

  // Función que llamarás para enviar los datos
  enviarComentario(): void {
    if (!this.producto) return;

    this.comentarioService.crearComentario(this.producto.id, this.nuevoComentario, this.nuevaPuntuacion).subscribe({
      next: () => {
        this.mostrarMensaje('¡Gracias por tu opinión!', 'success');
        this.nuevoComentario = '';
        this.nuevaPuntuacion = 0;
        this.cargarProducto(this.producto!.id);
      },
      error: () => this.mostrarMensaje('Ya has comentado en este producto o hubo un error', 'error')
    });
  }
  obtenerComentariosProducto(): void {
    this.comentarioService.obtenerComentariosProducto(this.producto!.id).subscribe({
      next: (comentarios: any[]) => {
        comentarios.forEach(c => {
          // Inicialización síncrona para evitar TypeErrors
          if (!c.usuario) {
            c.usuario = { nombre: 'Cargando...' };
          }

          const userId = c.usuarioId || c.idUsuario;
          if (userId) {
            this.authService.geUserById(userId).subscribe({
              next: (u) => {
                c.usuario.nombre = u.nombre || u.name || 'Usuario';
                this.cd.detectChanges();
              },
              error: () => {
                c.usuario.nombre = 'Anónimo';
                this.cd.detectChanges();
              }
            });
          }
        });
        this.producto!.comentarios = comentarios;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error cargando comentarios:', err)
    });
  }

}