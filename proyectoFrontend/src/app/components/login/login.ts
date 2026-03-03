import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // <--- 1. Importa esto
import { AuthService } from '../../services/auth'; // Ajusta la ruta
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
})
/**
 * Componente para el inicio de sesión de usuarios.
 * Maneja el formulario de credenciales y la comunicación con el servicio de autenticación.
 */
export class LoginComponent {
  // Cambiamos 'username' por 'nombre' para que coincida con tu JSON
  credentials = { nombre: '', password: '' };
  errorLogin: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  onLogin() {
    console.log('Enviando esto al server:', this.credentials);
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('¡Login ok!', response);
        // Force a full reload so app.ts re-runs ngOnInit and fetches the profile
        window.location.href = '/';
      },
      error: (err) => {
        // Si sale 401 aquí, es que el nombre/password no coinciden en la BD
        console.error('Error 401: Credenciales fallidas', err);
        this.errorLogin = true;
      }
    });
  }
}