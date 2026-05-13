import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MensajeService } from '../../services/mensaje';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-contacto',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css'
})
export class ContactoComponent implements OnInit {
  // Campos del formulario
  nombre: string = '';
  correo: string = '';
  tema: string = '';
  mensaje: string = '';
  aceptaTerminos: boolean = false;
  emailOficial: string = 'linkedlistoficial@gmail.com';

  constructor(
    private mensajeService: MensajeService,
    private http: HttpClient,
    public authService: AuthService
  ) { }

  ngOnInit() {
    // Recuperar el correo oficial del backend
    this.http.get<{ email: string }>('https://localhost:8443/contacto/email').subscribe({
      next: (res) => this.emailOficial = res.email,
      error: (err) => console.error('Error recuperando correo oficial:', err)
    });

    if (this.authService.isLoggedIn()) {
      this.nombre = this.authService.getNombre() || '';
      this.correo = this.authService.getEmail() || '';

      if (!this.nombre || !this.correo) {
        const id = this.authService.getId();
        if (id) {
          this.authService.geUserById(id).subscribe({
            next: (u) => {
              this.nombre = this.nombre || u.nombre;
              this.correo = this.correo || u.email;
            },
            error: (err) => console.error('Error recuperando datos de contacto:', err)
          });
        }
      }
    }
  }

  // Valida el correo con regex simple
  private validarCorreo(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  onSubmit() {
    // Validar nombre (mínimo 3 caracteres)
    if (!this.nombre || this.nombre.trim().length < 3) {
      this.mensajeService.mostrarError('El nombre debe tener al menos 3 caracteres.');
      return;
    }

    // Validar correo
    if (!this.correo || !this.validarCorreo(this.correo)) {
      this.mensajeService.mostrarError('Introduce un correo electrónico válido.');
      return;
    }

    // Validar tema seleccionado
    if (!this.tema) {
      this.mensajeService.mostrarError('Selecciona un tema para tu mensaje.');
      return;
    }

    // Validar mensaje (mínimo 10 caracteres)
    if (!this.mensaje || this.mensaje.trim().length < 10) {
      this.mensajeService.mostrarError('El mensaje debe tener al menos 10 caracteres.');
      return;
    }

    // Validar checkbox de términos
    if (!this.aceptaTerminos) {
      this.mensajeService.mostrarError('Debes aceptar los términos y la privacidad.');
      return;
    }

    // Envío real al backend
    const payload = {
      nombre: this.nombre,
      correo: this.correo,
      tema: this.tema,
      mensaje: this.mensaje
    };

    this.http.post('https://localhost:8443/contacto', payload).subscribe({
      next: () => {
        this.mensajeService.mostrarSuccess('¡Mensaje enviado correctamente! Te responderemos lo antes posible.');
        this.resetForm();
      },
      error: (err) => {
        console.error('Error al enviar contacto:', err);
        this.mensajeService.mostrarError('Hubo un error al enviar el mensaje. Inténtalo más tarde.');
      }
    });
  }

  private resetForm() {
    // Limpiamos el formulario (respetando si está logueado)
    if (this.authService.isLoggedIn()) {
      this.nombre = this.authService.getNombre() || '';
      this.correo = this.authService.getEmail() || '';
    } else {
      this.nombre = '';
      this.correo = '';
    }
    this.tema = '';
    this.mensaje = '';
    this.aceptaTerminos = false;
  }
}
