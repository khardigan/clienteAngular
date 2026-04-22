import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-administrarProductos',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    templateUrl: './administrarProductos.html'
})
export class AdministrarProductosComponent implements OnInit {
    isLoggedIn = false; // Dice si hay alguien logueado
    isAdmin = false;    // Dice si ese alguien es administrador
    productos: Producto[] = [];
    API = 'https://localhost:8443/productos';
    //    @PostMapping("/confirm/{id}")
    //    @DeleteMapping("/reject/{id}")
    constructor(
        private http: HttpClient,
        private cd: ChangeDetectorRef,
        private authService: AuthService
    ) {
        console.log('INSTANCIA ADMIN PRODUCTOS');

    }

    // Genera las cabeceras con el token JWT del usuario logueado
    // Prepara el token para que el servidor nos deje hacer cosas protegidas.
    private obtenerCabeceras(): HttpHeaders {
        const token = this.authService.getToken();

        return new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });

    }
    // Al entrar mira si eres admin para decidir qué enseñarte.
    ngOnInit(): void {
        this.authService.loginStatus$.subscribe(logged => {
            this.isLoggedIn = logged;
            this.isAdmin = this.authService.isAdmin();

            if (logged) {
                this.cargarProductos();
            }
        });
    }
    // Baja todos los productos, poniendo primero los que aún no se han aprobado.
    cargarProductos() {
        console.log('TOKEN:', this.authService.getToken());

        this.http.get<Producto[]>(this.API, { headers: this.obtenerCabeceras() })
            .subscribe({
                next: res => {
                    this.productos = [...res.sort((a, b) => {
                        const aPendiente = !a.confirmado;
                        const bPendiente = !b.confirmado;
                        return aPendiente === bPendiente ? 0 : aPendiente ? -1 : 1;
                    })];

                    this.cd.detectChanges(); // 🔥 CLAVE
                },
                error: err => console.error('Error al obtener productos:', err)
            });
    }


    // Borra el producto definitivamente si el admin le da a rechazar.
    eliminarProducto(id?: number) {
        if (id == null) return;

        this.http.delete(this.API + '/reject/' + id)
            .subscribe({
                next: () => {
                    this.cargarProductos();
                },
                error: err => console.error('Error al eliminar producto:', err)
            });
    }


    // Aprueba el producto para que salga en la tienda normal.
    confirmarProducto(id?: number) {
        if (id == null) return;

        this.http.post(this.API + '/confirm/' + id, null, { headers: this.obtenerCabeceras() })
            .subscribe({
                next: () => {
                    this.cargarProductos();
                },
                error: err => console.error('Error al confirmar producto:', err)
            });
    }
}
