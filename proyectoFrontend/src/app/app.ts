import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthService } from './services/auth'; // El servicio está aquí
import { AuthInterceptor } from './services/authInterceptor'; // El interceptor está aquí


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
   providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
})
export class App {
constructor(public authService: AuthService) {}

  onLogout() {
    this.authService.logout();
    // Al cerrar sesión, el isLoggedIn() pasará a ser false y el nav cambiará solo
  }
}
