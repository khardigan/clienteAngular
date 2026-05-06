import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-recuperar-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './recuperar-password.html',
  styleUrl: './recuperar-password.css'
})
export class RecuperarPasswordComponent {
  nombre: string = '';
  email: string = '';
  mensaje: string = '';
  error: string = '';
  enviando: boolean = false;

  constructor(private authService: AuthService) { }

  onRecuperar() {
    this.enviando = true;
    this.mensaje = '';
    this.error = '';

    // Enviamos nombre y email al servicio
    this.authService.solicitarRecuperacion(this.nombre, this.email).subscribe({
      next: (res) => {
        this.mensaje = 'Si el correo existe en nuestra base de datos, recibirás un enlace pronto.';
        this.enviando = false;
      },
      error: (err) => {
        this.error = 'Hubo un error al procesar la solicitud. Inténtalo de nuevo.';
        this.enviando = false;
      }
    });
  }
}
