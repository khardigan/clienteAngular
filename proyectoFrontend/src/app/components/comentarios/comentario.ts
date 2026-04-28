import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ComentarioService } from '../../services/comentarioService';
import { AuthService } from '../../services/auth';
import { Comentario } from '../../models/comentario';
import { ProductoService } from '../../services/producto';

@Component({
  selector: 'app-comentario',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './comentario.html',
  styleUrl: './comentario.css'
})
export class ComentarioComponent implements OnInit {
  Comentarios: Comentario[] = [];
  TusComentarios: Comentario[] = [];
  filtroProducto: string = ''; // Nueva variable para el filtro

  constructor(
    private comentarioService: ComentarioService,
    public authService: AuthService,
    private productoService: ProductoService,
    private cd: ChangeDetectorRef // Fuerza el repintado cuando llegan datos
  ) { }

  ngOnInit() {
    this.cargarTodosComentarios();
    if (this.authService.isLoggedIn()) {
      this.cargarComentariosUsuario();
    }
  }

  cancelarEdicion(comentario: any) {
    comentario.editando = false; // Cerramos el modo edición
    this.cargarComentariosUsuario(); // Refrescamos listas
    this.cargarTodosComentarios();
  }
  habilitarEdicion(comentario: any) {
    comentario.editando = true; // Abrimos el modo edición
  }




  // Función genérica para eliminar cualquier comentario (usada por el admin)
  eliminarCualquierComentario(comentario: Comentario) {
    if (confirm('¿Estás seguro de que quieres eliminar este comentario como administrador?')) {
      this.comentarioService.eliminarComentario(comentario.id).subscribe({
        next: () => {
          this.cargarTodosComentarios(); // Refrescamos la lista global
          this.cargarComentariosUsuario(); // Y la del usuario por si era suyo
        },
        error: (err) => console.error('Error al eliminar', err)
      });
    }
  }
  // Carga todos los comentarios y resuelve el nombre de cada producto
  cargarTodosComentarios() {
    this.comentarioService.getTodosLosComentarios().subscribe((res: Comentario[]) => {
      this.Comentarios = res.map(c => {
        const comment: Comentario = {
          ...c,
          contenido: c.contenido || (c as any).comentario || (c as any).texto || '',
          puntuacion: c.puntuacion !== undefined ? c.puntuacion : 0,
          productoNombre: 'Cargando producto...'
        };

        if (c.productoId) {
          this.productoService.obtenerProducto(c.productoId).subscribe({
            next: (p) => { comment.productoNombre = p.nombre; this.cd.detectChanges(); },
            error: () => { comment.productoNombre = 'Producto no disponible'; this.cd.detectChanges(); }
          });
        } else {
          comment.productoNombre = 'Feedback General';
        }

        return comment;
      });
      this.cd.detectChanges(); // Repinta la vista con los comentarios recién cargados
    });
  }
  // Carga solo los comentarios del usuario logueado
  cargarComentariosUsuario() {
    this.comentarioService.getMisComentarios().subscribe((res: any[]) => {
      this.TusComentarios = res.map(c => {
        const comment: Comentario = {
          ...c,
          editando: false,
          contenido: c.contenido || c.comentario || c.texto || '',
          puntuacion: c.puntuacion || 0,
          productoNombre: 'Cargando producto...'
        };

        if (c.productoId) {
          this.productoService.obtenerProducto(c.productoId).subscribe({
            next: (p) => { comment.productoNombre = p.nombre; this.cd.detectChanges(); },
            error: () => { comment.productoNombre = 'Producto no disponible'; this.cd.detectChanges(); }
          });
        } else {
          comment.productoNombre = 'Feedback General';
        }

        return comment;
      });
      this.cd.detectChanges(); // Repinta la vista con los comentarios del usuario
    });
  }


  guardarCambios(comentario: any) {
    // 1. Cerramos el modo edición inmediatamente para feedback visual instantáneo
    comentario.editando = false;

    const datosParaBackend = {
      contenido: comentario.contenido,
      puntuacion: comentario.puntuacion.toString()
    };


    this.comentarioService.actualizarComentario(comentario.id, datosParaBackend.contenido, datosParaBackend.puntuacion)
      .subscribe({
        next: (res) => {
          // 2. Refrescamos los datos para asegurar que tenemos lo último del servidor
          this.cargarComentariosUsuario();
          this.cargarTodosComentarios();
        },
        error: (err) => {
          console.error('Error al guardar:', err);
          // 3. Si falla, volvemos a abrir la edición para que el usuario no pierda lo que escribió
          comentario.editando = true;
          alert('Hubo un error al guardar los cambios.');
        }
      });
  }
  eliminarComentario(comentario: Comentario) {
    if (confirm('¿Estás seguro?')) {
      this.comentarioService.eliminarComentario(comentario.id).subscribe(() => {
        this.cargarComentariosUsuario();
        this.cargarTodosComentarios();
      });
    }
  }

  // Getter para filtrar los comentarios de la comunidad
  get comentariosFiltrados(): Comentario[] {
    if (!this.filtroProducto.trim()) {
      return this.Comentarios;
    }
    const busqueda = this.filtroProducto.toLowerCase();
    return this.Comentarios.filter(c => 
      c.productoNombre?.toLowerCase().includes(busqueda)
    );
  }
}