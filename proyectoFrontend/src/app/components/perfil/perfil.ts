import { Component, OnInit, ChangeDetectorRef, signal, NgZone, ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { PerfilService } from '../../services/perfil';
import { Perfil } from '../../models/perfil';
import { ListaService } from '../../services/lista';
import { ProductoService } from '../../services/producto';
import { AuthService } from '../../services/auth';
import { MensajeService } from '../../services/mensaje';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {

  // ==========================================
  // ESTADO DEL PERFIL Y MENSAJERÍA
  // ==========================================
  perfilSignal = signal<Perfil | null>(null);

  // Getter para compatibilidad con el template si fuera necesario, pero usaremos el signal directamente.
  get perfil() { return this.perfilSignal(); }
  set perfil(value: Perfil | null) { this.perfilSignal.set(value); }

  mensajeSuccess: string = '';
  mensajeError: string = '';

  // ==========================================
  // CONTADORES REACTIVOS (Signals)
  // ==========================================
  totalListas = signal(0);
  totalProductos = signal(0);
  totalColaboraciones = signal(0);
  totalPublicas = signal(0);
  nombreCuenta: string = '';

  constructor(
    private perfilService: PerfilService,
    private listaService: ListaService,
    private productoService: ProductoService,
    private authService: AuthService,
    private mensajeService: MensajeService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private appRef: ApplicationRef
  ) { }

  // ==========================================
  // INICIALIZACIÓN Y CARGA DE DATOS
  // ==========================================

  ngOnInit(): void {
    const sessionUserId = this.authService.getId();
    this.nombreCuenta = this.authService.getNombre() || '';

    this.perfilService.obtenerPerfilDesdeToken().subscribe({
      next: (perfil) => {
        this.perfilSignal.set({
          ...perfil,
          subtitulo: perfil.subtitulo || '',
          residencia: perfil.residencia || '',
          email: perfil.email || '',
          telefono: perfil.telefono || '',
          fechaNacimiento: perfil.fechaNacimiento || '',
          edad: perfil.edad || '',
          imagenUrl: perfil.imagenUrl || 'https://bootdey.com/img/Content/avatar/avatar7.png'
        });

        if (perfil.usuarioId) {
          this.cargarContadores(perfil.usuarioId);
        }
      },
      error: (err) => console.error("Perfil - Error cargando perfil:", err)
    });

    // Si ya tenemos el ID de la sesión, podemos ir cargando contadores
    if (sessionUserId) {
      this.cargarContadores(sessionUserId);
    }
  }

  cargarContadores(id: number): void {
    if (!id) return;

    this.listaService.obtenerMisListas().subscribe({
      next: (listas) => {
        const idNumber = Number(id);
        this.totalListas.set(listas.filter(l => Number(l.usuarioDuenoId) === idNumber).length);
        this.totalColaboraciones.set(listas.filter(l => l.usuariosCompartida && l.usuariosCompartida.length > 0).length);
        this.totalPublicas.set(listas.filter(l => Number(l.usuarioDuenoId) === idNumber && l.publicada).length);
      }
    });

    this.productoService.listarProductosCatalogSubidosPorUsuario(id).subscribe({
      next: (catalogo) => {
        this.totalProductos.set(catalogo.length);
      }
    });
  }

  // ==========================================
  // VALIDACIONES
  // ==========================================

  validarNombre(nombre: string): boolean {
    if (!nombre) return true;
    const nombreRegex = /^.{3,}$/;
    return nombreRegex.test(nombre);
  }

  validarTelefono(telefono: string): boolean {
    if (!telefono) return true;
    const telefonoRegex = /^\d{9}$/;
    return telefonoRegex.test(telefono);
  }

  validarCumpleaniosYAniosEdad(fechaNacimiento: string | undefined, edad: string | undefined): boolean {
    if (!fechaNacimiento || !edad) return false;
    const fechaRegex = /^(\d{4}-\d{2}-\d{2})|(\d{2}\/\d{2}\/\d{4})$/;
    const edadRegex = /^\d{1,3}$/;

    if (!fechaRegex.test(fechaNacimiento) || !edadRegex.test(edad)) return false;

    const nacimiento = new Date(fechaNacimiento);
    const hoy = new Date();

    let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();

    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edadCalculada--;
    }
    return edadCalculada === Number(edad);
  }

  // ==========================================
  // GESTIÓN DEL PERFIL
  // ==========================================

  guardarCambios(): void {
    if (!this.perfil || !this.perfil.idPerfil) return;

    if (this.perfil.nombrePerfil && !this.validarNombre(this.perfil.nombrePerfil)) {
      this.mensajeService.mostrarError('El nombre público debe tener al menos 3 caracteres.');
      return;
    }

    if (this.perfil.telefono && !this.validarTelefono(this.perfil.telefono)) {
      this.mensajeService.mostrarError('El número de teléfono debe tener 9 dígitos.');
      return;
    }

    this.mensajeService.confirmar('¿Estás seguro de que quieres actualizar tu perfil?', () => {
      this.perfilService.actualizarPerfil(this.perfil!.idPerfil!, this.perfil!).subscribe({
        next: (actualizado) => {
          this.perfil = actualizado;
          this.mensajeService.mostrarSuccess('¡Perfil actualizado con éxito!');
          this.perfilService.notificarCambioPerfil(); // Notificamos al Nav, es necesario para que se actualice el navbar
          this.cd.detectChanges();
        },
        error: (err) => {
          console.error("Error al actualizar perfil:", err);
          this.mensajeService.mostrarError('No se pudieron guardar los cambios en el servidor.');
          this.cd.detectChanges();
        }
      });
    });
  }
}

export type { Perfil };