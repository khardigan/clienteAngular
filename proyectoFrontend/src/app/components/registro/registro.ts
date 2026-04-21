import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro.html',
  styleUrl: './registro.css'
})
export class RegistroComponent {
  // Modelo para el registro compatible con lo que espera el servicio
  user = {
    nombre: '',
    email: '',
    password: '',
    passwordConfirm: ''
  };
  errorRegistro: string = '';

  constructor(private authService: AuthService, private router: Router) { }

  onRegister() {
    if (this.user.password !== this.user.passwordConfirm) {
      this.errorRegistro = 'Las contraseñas no coinciden';
      return;
    }

    console.log('Iniciando registro para:', this.user.nombre);

    this.authService.register(this.user).subscribe({
      next: (res) => {
        console.log('¡Registro exitoso!', res);
        this.router.navigate(['/perfil']);
      },
      error: (err) => {
        console.error('Error en el registro:', err);
        this.errorRegistro = 'Hubo un error al crear la cuenta. Es posible que el nombre o email ya estén en uso.';
      }
    });
  }
}
