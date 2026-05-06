import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-verify-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-account.html',
  styleUrl: './verify-account.css'
})
export class VerifyAccountComponent implements OnInit {
  token: string = '';
  verificando: boolean = true;
  exito: boolean = false;
  error: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    
    if (!this.token) {
      this.error = 'Token de verificación ausente. Por favor, revisa el enlace de tu correo.';
      this.verificando = false;
      return;
    }

    this.verificar();
  }

  verificar() {
    this.authService.verificarEmail(this.token).subscribe({
      next: (res) => {
        this.exito = true;
        this.verificando = false;
        // Redirigir al login después de 5 segundos
        setTimeout(() => this.router.navigate(['/login']), 5000);
      },
      error: (err) => {
        this.error = err.error?.error || 'El enlace de verificación ha caducado o no es válido.';
        this.verificando = false;
      }
    });
  }
}
