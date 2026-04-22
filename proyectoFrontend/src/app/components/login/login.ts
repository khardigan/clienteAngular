import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
// Componente para el inicio de sesión de usuarios.
// Maneja el formulario de credenciales y la comunicación con el servicio de autenticación.
export class LoginComponent {
  // Cambiamos 'username' por 'nombre' para que coincida con tu JSON
  credentials = { nombre: '', password: '' };
  errorLogin: boolean = false;

  constructor(private authService: AuthService, private router: Router) { }

  // Manda el usuario y la contraseña al servidor para entrar en la cuenta.
  onLogin() {
    console.log('Enviando esto al server:', this.credentials);
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('¡Login ok!', response);
        this.router.navigate(['/perfil']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorLogin = true;
      }
    });
  }

  // Muestra un aviso para funciones no implementadas aún
  // Aviso de que todavía no hemos hecho la parte de recuperar contraseña.
  forgotPasswordAlert(event: Event) {
    event.preventDefault();
    alert('Aun no implementado');
  }
}