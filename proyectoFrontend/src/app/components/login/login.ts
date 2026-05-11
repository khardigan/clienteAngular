import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';




@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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
    //console.log('Enviando esto al server:', this.credentials);
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        //creamos

        this.router.navigate(['/perfil']);
      },
      error: (err) => {
        console.error('Error en login:', err);
        this.errorLogin = true;
      }
    });
  }
}

