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

    // Cambia el rol de un usuario (de USER a ADMIN o viceversa).
    cambiarRol(u: Usuario, nuevoRol: string) {
        const mensaje = nuevoRol === 'ADMIN'
            ? `¿Estás seguro de que quieres nombrar ADMINISTRADOR a ${u.nombre}?`
            : `¿Estás seguro de que quieres quitar los permisos de administrador a ${u.nombre}?`;

        this.mensajeService.confirmar(mensaje, () => {
            const copiaUsuario = { ...u, rol: nuevoRol };

            this.http.put<Usuario>(this.API + '/actualizar/' + u.id, copiaUsuario, { headers: this.obtenerCabeceras() })
                .subscribe({
                    next: (res) => {
                        this.mensajeService.mostrarSuccess(`Rol de ${u.nombre} actualizado a ${nuevoRol}`);
                        // Actualizar el usuario en la lista local
                        u.rol = nuevoRol;
                        this.cd.detectChanges();
                    },
                    error: err => {
                        console.error('Error al cambiar rol:', err);
                        this.mensajeService.mostrarError('No se pudo cambiar el rol del usuario');
                    }
                });
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
