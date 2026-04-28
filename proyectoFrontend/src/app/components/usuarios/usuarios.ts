import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { AuthService } from '../../services/auth';
import { MensajeService } from '../../services/mensaje';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    templateUrl: './usuarios.html',
    styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
    usuarios: Usuario[] = [];
    API = 'https://localhost:8443/usuarios';

    constructor(
        private http: HttpClient,
        private cd: ChangeDetectorRef,
        private authService: AuthService,
        private mensajeService: MensajeService
    ) { }

    // Genera las cabeceras con el token JWT del usuario logueado
    private obtenerCabeceras(): HttpHeaders {
        const token = this.authService.getToken();
        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
    }

    // Carga la lista de todos los usuarios al abrir la página.
    ngOnInit(): void {
        this.http.get<Usuario[]>(this.API, { headers: this.obtenerCabeceras() })
            .subscribe({
                next: res => {
                    this.usuarios = res;
                    this.cd.detectChanges();
                },
                error: err => console.error('Error al obtener usuarios:', err)
            });
    }

    // Borra a un usuario del sistema por su ID.
    eliminarUsuario(id: number) {
        this.mensajeService.confirmar('¿Estás seguro de que quieres eliminar a este usuario definitivamente?', () => {
            this.http.delete(this.API + '/' + id, { headers: this.obtenerCabeceras() })
                .subscribe({
                    next: () => {
                        this.mensajeService.mostrarSuccess('Usuario eliminado correctamente');
                        this.usuarios = this.usuarios.filter(u => u.id !== id);
                        this.cd.detectChanges();
                    },
                    error: err => console.error('Error al eliminar usuario:', err)
                });
        });
    }
}
