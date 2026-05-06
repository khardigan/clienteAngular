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

  // ==========================================
  // ESTADO DEL PRODUCTO
  // ==========================================
  producto: Producto | null = null;
  cargando = true;
  error = false;

  // ==========================================
  // ESTADO DE LISTAS Y COMENTARIOS
  // ==========================================
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

  // ==========================================
  // INICIALIZACIÓN Y CARGA DE DATOS
  // ==========================================

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

  cargarListas(): void {
    this.listaService.obtenerMisListas().subscribe({
      next: (res) => {
        this.listas = res;
        this.cd.detectChanges();
      },
      error: (err) => console.error('Error cargando listas:', err)
    });
  }

  obtenerComentariosProducto(): void {
    this.comentarioService.obtenerComentariosProducto(this.producto!.id).subscribe({
      next: (comentarios: any[]) => {
        comentarios.forEach(c => {
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

  // ==========================================
  // GESTIÓN DE LISTAS
  // ==========================================

  confirmarAgregarALista(): void {
    if (!this.producto || !this.listaSeleccionada) return;
    this.agregarProductoOficialALista(this.listaSeleccionada, this.producto);
  }

  agregarProductoOficialALista(lista: ListaDetalle, producto: Producto): void {
    const currentIds = lista.productos?.map(p => p.id) ?? [];
    if (currentIds.includes(producto.id)) {
      this.mostrarMensaje('El producto ya está en la lista', 'error');
      return;
    }

    const newIds = [...currentIds, producto.id];
    const usuariosIds = lista.usuariosCompartida ? lista.usuariosCompartida.map(u => u.id) : [];

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
        this.mostrarMensaje(err?.error?.message || 'No se pudo añadir el producto', 'error');
        this.cd.detectChanges();
      }
    });
  }

  // ==========================================
  // GESTIÓN DE COMENTARIOS Y VALORACIONES
  // ==========================================

  setRating(valor: number): void {
    this.nuevaPuntuacion = valor;
  }

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

  // ==========================================
  // UTILIDADES DE UI Y NAVEGACIÓN
  // ==========================================

  mostrarMensaje(texto: string, tipo: 'success' | 'error'): void {
    if (tipo === 'success') {
      this.mensajeService.mostrarSuccess(texto);
    } else {
      this.mensajeService.mostrarError(texto);
    }
  }

  getImagen(): string {
    if (this.producto?.imagenUrl && this.producto.imagenUrl.startsWith('http')) {
      return this.producto.imagenUrl;
    }
    const seed = this.producto?.nombre || 'default';
    return `https://picsum.photos/seed/${seed}/800/600`;
  }

  isExternalLink(url?: string): boolean {
    return !!url && (url.startsWith('http') || url.includes('Ver en: http'));
  }

  extractUrl(text?: string): string {
    if (!text) return '';
    if (text.startsWith('http')) return text;
    const parts = text.split('Ver en: ');
    return parts.length > 1 ? parts[1].trim() : text;
  }

  getMediaPuntuacion(): number {
    return this.producto?.mediaPuntuacion || 0;
  }

  getMediaEstrellas(): string {
    const media = this.getMediaPuntuacion();
    if (media <= 0) return '';

    const estrellasEnteras = Math.floor(media);
    const tieneMediaEstrella = (media - estrellasEnteras) >= 0.5;
    let estrellasHTML = '';

    for (let i = 0; i < estrellasEnteras; i++) estrellasHTML += '<i class="bi bi-star-fill"></i> ';
    if (tieneMediaEstrella) estrellasHTML += '<i class="bi bi-star-half"></i> ';
    for (let i = estrellasEnteras + (tieneMediaEstrella ? 1 : 0); i < 5; i++) estrellasHTML += '<i class="bi bi-star"></i> ';

    return estrellasHTML.trim();
  }

  volver(): void {
    this.router.navigate(['/productos']);
  }
}