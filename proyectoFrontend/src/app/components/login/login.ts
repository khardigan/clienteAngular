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
export class LoginComponent {
  // Cambiamos 'username' por 'nombre' para que coincida con tu JSON
  credentials = { nombre: '', password: '' }; 
  errorLogin: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  onLogin() {
    console.log('Enviando esto al server:', this.credentials);
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        console.log('¡Login ok!', response);
        this.router.navigate(['/']); 
      },
      error: (err) => {
        // Si sale 401 aquí, es que el nombre/password no coinciden en la BD
        console.error('Error 401: Credenciales fallidas', err);
        this.errorLogin = true;
      }
    });
  }
}