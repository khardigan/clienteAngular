import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Producto } from '../../models/producto';
import { AuthService } from '../../services/auth';
import { MensajeService } from '../../services/mensaje';
import { ProductoService } from '../../services/producto';

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
    categoriasGenericas: string[] = [];
    supermercadosOficiales: string[] = [];

    nuevoPrecio: number = 0;
    nuevoSupermercado: string = '';
    nuevaCategoria: string = '';

    constructor(
        private http: HttpClient,
        private cd: ChangeDetectorRef,
        private authService: AuthService,
        private mensajeService: MensajeService,
        private productoService: ProductoService
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
                this.cargarListasDinamicas();
                this.cargarProductos();
            }
        });
    }

    cargarListasDinamicas() {
        this.productoService.listarCategorias().subscribe(cats => {
            this.categoriasGenericas = cats;
            this.cd.detectChanges();
        });
        this.productoService.listarSupermercados().subscribe(sups => {
            this.supermercadosOficiales = sups;
            this.cd.detectChanges();
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

        this.mensajeService.confirmar('¿Estás seguro de que quieres eliminar este producto definitivamente?', () => {
            this.http.delete(this.API + '/reject/' + id)
                .subscribe({
                    next: () => {
                        this.mensajeService.mostrarSuccess('Producto eliminado correctamente');
                        this.cargarProductos();
                    },
                    error: err => console.error('Error al eliminar producto:', err)
                });
        });
    }


    // Aprueba el producto para que salga en la tienda normal.
    confirmarProducto(id?: number) {
        if (id == null) return;

        this.http.post(this.API + '/confirm/' + id, null, { headers: this.obtenerCabeceras() })
            .subscribe({
                next: () => {
                    this.mensajeService.mostrarSuccess('Producto confirmado');
                    this.cargarProductos();
                },
                error: err => console.error('Error al confirmar producto:', err)
            });
    }

    // Actualiza los datos de un producto (supermercado y categoría).
    actualizarProducto(p: Producto) {
        if (!p.id) return;

        const body = {
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: p.precio,
            supermercado: p.supermercado,
            categoria: p.categoria,
            imagenUrl: p.imagenUrl
        };

        this.http.put(this.API + '/' + p.id, body, { headers: this.obtenerCabeceras() })
            .subscribe({
                next: () => {
                    this.mensajeService.mostrarSuccess('Producto actualizado con éxito');
                    this.cargarProductos();
                },
                error: err => {
                    console.error('Error al actualizar producto:', err);
                    this.mensajeService.mostrarError('Error al actualizar el producto');
                }
            });
    }
    getSupermercados(): string[] {
        // Si la lista del servidor ya trae "Mercado Libre", no lo añadimos otra vez
        const lista = [...this.supermercadosOficiales];
        if (!lista.includes('Mercado Libre')) {
            lista.push('Mercado Libre');
        }
        return lista;
    }


}
