import { Component, OnInit, ChangeDetectorRef, signal, NgZone, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Perfil, PerfilService } from '../../services/perfil';
import { ListaService } from '../../services/lista';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';
import { MensajeService } from '../../services/mensaje';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {
  perfil: Perfil | null = null;
  mensajeSuccess: string = '';
  mensajeError: string = '';

  // Usamos Signals para los contadores. Estos notifican automáticamente a la plantilla 
  // cuando cambian, permitiendo una actualización reactiva y fluida.
  totalListas = signal(0);
  totalProductos = signal(0);
  totalColaboraciones = signal(0);
  totalPublicas = signal(0);

  constructor(
    private perfilService: PerfilService,
    private listaService: ListaService,
    private productoService: ProductoService,
    private authService: AuthService,
    private mensajeService: MensajeService, // Inyectamos el servicio global
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private appRef: ApplicationRef
  ) { }

  ngOnInit(): void {
    // Obtenemos el ID de sesión del localStorage nada más entrar para no mostrar 0s mientras carga el perfil
    const sessionUserId = this.authService.getId();
    // 1. Cargamos los datos personales del perfil desde el token
    this.perfilService.obtenerPerfilDesdeToken().subscribe({
      next: (perfil) => {
        // Envolvemos en zone.run para asegurar que Angular detecte el cambio tras la navegación
        this.zone.run(() => {
          this.perfil = {
            ...perfil,
            subtitulo: perfil.subtitulo || '',
            residencia: perfil.residencia || '',
            email: perfil.email || '',
            telefono: perfil.telefono || '',
            fechaNacimiento: perfil.fechaNacimiento || '',
            edad: perfil.edad || ''
          };
        });

        // Si el perfil tiene un ID propio, lo usamos para asegurar que las estadísticas son las correctas
        if (perfil.usuarioId) {
          this.cargarContadores(perfil.usuarioId);
        }
      },
      error: (err) => console.error("Perfil - Error cargando perfil:", err)
    });

    // 2. Disparo inmediato con el ID de sesión para ganar tiempo y evitar el "efecto 0"
    if (sessionUserId) {
      this.cargarContadores(sessionUserId);
    }
  }


  //Carga y calcula las estadísticas del usuario (listas, productos, colaboraciones).
  //@param id ID del usuario para el cual cargar los datos.
  cargarContadores(id: number): void {
    if (!id) return;
    // Petición de listas (propias y compartidas)
    this.listaService.obtenerMisListas().subscribe({
      next: (listas) => {
        // Pequeño retardo para dar tiempo a que el DOM se renderice si se acaba de activar el *ngIf
        setTimeout(() => {
          this.zone.run(() => {
            const idNumber = Number(id);
            // Actualizamos los Signals con los resultados filtrados
            this.totalListas.set(listas.filter(l => Number(l.usuarioDuenoId) === idNumber).length);
            this.totalColaboraciones.set(listas.filter(l => l.usuariosCompartida && l.usuariosCompartida.length > 0).length);
            this.totalPublicas.set(listas.filter(l => Number(l.usuarioDuenoId) === idNumber && l.publicada).length);

            // Forzamos un ciclo de detección de cambios en toda la app para evitar que se queden en 0 tras navegar
            this.appRef.tick();
          });
        }, 50);
      }
    });

    // Petición de productos subidos al catálogo global por el usuario (excluyendo privados)
    this.productoService.listarProductosCatalogSubidosPorUsuario(id).subscribe({
      next: (catalogo) => {
        setTimeout(() => {
          this.zone.run(() => {
            this.totalProductos.set(catalogo.length);
            this.appRef.tick(); // Refresco forzado de la interfaz
          });
        }, 50);
      }
    });
  }

  // Manda los datos del perfil al servidor para guardarlos.
  guardarCambios(): void {
    if (!this.perfil || !this.perfil.idPerfil) return;

    // Validación básica antes de enviar
    if (this.perfil.nombrePerfil && this.perfil.nombrePerfil.length < 3) {
      this.mensajeService.mostrarError('El nombre público debe tener al menos 3 caracteres.');
      return;
    }

    this.perfilService.actualizarPerfil(this.perfil.idPerfil, this.perfil).subscribe({
      next: (actualizado) => {
        this.perfil = actualizado;
        this.mensajeService.mostrarSuccess('¡Perfil actualizado con éxito!');
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error("Error al actualizar perfil:", err);
        this.mensajeService.mostrarError('No se pudieron guardar los cambios en el servidor.');
        this.cd.detectChanges();
      }
    });
  }
}

export type { Perfil };