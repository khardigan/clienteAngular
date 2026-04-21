import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './services/auth';
import { PerfilService } from './services/perfil';
import { AuthInterceptor } from './services/authInterceptor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
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
