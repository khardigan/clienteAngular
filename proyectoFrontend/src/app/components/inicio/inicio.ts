import { Component, OnInit, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ListaService } from '../../services/lista';
import { ListaDetalle } from '../../models/lista';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ComentarioService } from '../../services/comentarioService';
import { Comentario } from '../../models/comentario';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';

// 1. Importa la función de registro
import { register } from 'swiper/element/bundle';

// 2. Ejecuta el registro (fuera de la clase o en el constructor)
register();

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA] // Esto ya lo tienes, ¡perfecto!
})
export class InicioComponent implements OnInit {
  listas: ListaDetalle[] = [];
  comentarios: Comentario[] = [];
  cargando = true;

  constructor(
    private listaService: ListaService,
    private comentarioService: ComentarioService,
    private productoService: ProductoService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarListasPublicas();
    this.cargarComentarios();
  }

  cargarListasPublicas(): void {
    this.cargando = true;
    this.listaService.getListasPublicas().subscribe({
      next: (data) => {
        this.listas = data.slice(0, 3);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar listas públicas', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  cargarComentarios(): void {
    this.comentarioService.getTodosLosComentarios().subscribe({
      next: (data) => {
        // 1. Filtramos y cortamos
        const comentariosBrutos = data
          .filter(c => c.contenido && c.contenido.length > 5)
          .slice(0, 6);

        // 2. Cargamos los nombres para cada comentario
        comentariosBrutos.forEach((comentario: any) => {
          // Inicialización síncrona inmediata
          if (!comentario.usuario) comentario.usuario = { nombre: 'Cargando...' };
          if (!comentario.productoNombre) comentario.productoNombre = 'Cargando...';
          // Cargar nombre de producto
          const prodId = comentario.productoId || comentario.idProducto;
          if (prodId) {
            this.productoService.obtenerProductoPorId(prodId).subscribe({
              next: (p) => {
                comentario.productoNombre = p.nombre;
                this.cdr.detectChanges();
              },
              error: () => {
                comentario.productoNombre = 'Producto no disponible';
                this.cdr.detectChanges();
              }
            });
          } else {
            comentario.productoNombre = 'Producto General';
          }

          // Cargar nombre de usuario
          const userId = comentario.usuarioId || (comentario.usuario ? comentario.usuario.id : null) || comentario.idUsuario;
          if (userId) {
            this.authService.geUserById(userId).subscribe({
              next: (u) => {
                comentario.usuario.nombre = u.nombre || u.name || 'Usuario';
                this.cdr.detectChanges();
              },
              error: () => {
                comentario.usuario.nombre = 'Anónimo';
                this.cdr.detectChanges();
              }
            });
          } else {
            comentario.usuario.nombre = 'Anónimo';
          }
        });

        this.comentarios = comentariosBrutos;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar comentarios', err)
    });
  }

  obtenerProductoNombre(idProducto: number): string {
    let nombreProducto = 'Producto no disponible';

    this.productoService.obtenerProductoPorId(idProducto).subscribe({
      next: (data) => {
        nombreProducto = data.nombre;
      },
      error: (err) => {
        console.error('Error al obtener el producto');
      }
    });

    return nombreProducto;
  }
  obtenerUsuarioNombre(idUsuario: number): string {
    let nombreUsuario = 'Usuario no disponible';

    this.authService.geUserById(idUsuario).subscribe({
      next: (data) => {
        nombreUsuario = data.name;
      },
      error: (err) => {
        console.error('Error al obtener el usuario');
      }
    });

    return nombreUsuario;
  }
}   
