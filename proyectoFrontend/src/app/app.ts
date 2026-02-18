import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './services/auth';
import { PerfilService } from './services/perfil'; // Importamos el servicio de perfil
import { AuthInterceptor } from './services/authInterceptor';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    PerfilService 
  ],
})
export class App implements OnInit {  // <-- implementamos OnInit
  perfil: any = null; // Aquí guardaremos el perfil

  constructor(
    public authService: AuthService,
    private perfilService: PerfilService
  ) {}

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      const usuarioId = Number(localStorage.getItem('id'));
      this.perfilService.obtenerPerfil(usuarioId).subscribe({
        next: (res: any) => this.perfil = res,
        error: (err: any) => console.error('Error cargando perfil:', err)
      });
    }
  }

  onLogout() {
    this.authService.logout();
    this.perfil = null; 
  }
}
