import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MensajeService } from '../../services/mensaje';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  nombre: string = '';
  password: string = '';
  email: string = '';
  confirmPassword: string = '';
  mensaje: string = '';
  error: string = '';
  enviando: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private mensajeService: MensajeService,
    private router: Router
  ) { }

  ngOnInit() {
    // Obtenemos el token y el nombre de la URL
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    this.nombre = this.route.snapshot.queryParamMap.get('nombre') || '';
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    if (!this.token) {
      this.error = 'Token no válido o ausente. Solicita un nuevo enlace.';
    }
  }


  onReset() {
    if (this.password !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.enviando = true;
    this.mensaje = '';
    this.error = '';
    //si el backend envia un mensaje en el error, mostrarlo con el servicio mensajes
    this.authService.resetearPassword(this.token, this.password, this.nombre, this.email).subscribe({
      next: (res) => {
        this.mensaje = '¡Contraseña actualizada con éxito! Ya puedes iniciar sesión.';
        this.enviando = false;
        //esperar 5 segundos y reenviar a login
        setTimeout(() => this.router.navigate(['/login']), 5000);
      },
      error: (err) => {
        this.error = 'El enlace ha caducado o no es válido.';
        this.enviando = false;
        //mostrar mensaje de error con servicio mensajes
        this.mensajeService.mostrarError('Error al restablecer la contraseña' + err.error.mensaje);
      }
    });
  }
}
