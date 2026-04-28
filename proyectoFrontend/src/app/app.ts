import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './services/auth';
import { PerfilService } from './services/perfil';
import { AuthInterceptor } from './services/authInterceptor';
import { MensajeService } from './services/mensaje';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
/**
 * Componente principal de la aplicación.
 * Gestiona la navegación superior, el estado de sesión y la carga inicial del perfil del usuario.
 */
export class App implements OnInit {
  perfil: any = null;
  menuAbierto: boolean = false;

  constructor(
    public authService: AuthService,
    private perfilService: PerfilService,
    public mensajeService: MensajeService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Escuchamos cambios en el estado de login para cargar el perfil al momento
    this.authService.loginStatus$.subscribe(isLoggedIn => {
      if (isLoggedIn) {
        this.cargarPerfil();
      } else {
        this.perfil = null;
      }
    });
  }

  comentarioAbierto: boolean = false;
  comentario: string = '';

  feedbackMsg = '';
  feedbackTipo: 'success' | 'danger' = 'success';

  mostrarFeedback(msj: string, tipo: 'success' | 'danger' = 'success'): void {
    if (tipo === 'success') {
      this.mensajeService.mostrarSuccess(msj);
    } else {
      this.mensajeService.mostrarError(msj);
    }
  }

  toggleComentario() {
    this.comentarioAbierto = !this.comentarioAbierto;
  }

  enviarComentario() {
    if (!this.comentario || this.comentario.trim().length === 0) return;

    const peticion = this.authService.enviarComentario(this.comentario);
    if (peticion) {
      peticion.subscribe({
        next: () => {
          this.comentario = '';
          this.comentarioAbierto = false;
          this.mostrarFeedback('Comentario enviado con éxito. ¡Gracias!', 'success');
        },
        error: (err: any) => {
          console.error('Error enviando comentario: ', err);
          this.mostrarFeedback('Ocurrió un error al enviar.', 'danger');
        }
      });
    }
  }

  cargarPerfil() {
    this.perfilService.obtenerPerfilDesdeToken().subscribe({
      next: (res: any) => {
        this.perfil = res;
        this.cd.detectChanges();
      },
      error: (err: any) => {
        console.error('Error cargando perfil:', err);
        // Si hay error serio, podríamos cerrar sesión, pero por ahora solo logueamos
      }
    });
  }

  toggleMenu(event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.menuAbierto = !this.menuAbierto;
  }

  onLogout() {
    this.authService.logout();
    this.perfil = null;
    this.menuAbierto = false;
  }
}
