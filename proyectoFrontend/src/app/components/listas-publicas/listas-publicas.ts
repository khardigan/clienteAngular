import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaService } from '../../services/lista';
import { ListaDetalle } from '../../models/lista';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-listas-publicas',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './listas-publicas.html',
    styleUrls: ['./listas-publicas.css']
})
export class ListasPublicasComponent implements OnInit {
    listas: ListaDetalle[] = [];
    cargando = true;
    mensaje: string | null = null;
    tipoMensaje: 'success' | 'danger' = 'success';

    constructor(
        private listaService: ListaService,
        private cdr: ChangeDetectorRef,
        private router: Router,
        private authService: AuthService
    ) { }
    isLoggedIn: boolean = false;
    isAdmin: boolean = false;

    // Al entrar mira si estás logueado y carga todas las listas públicas.
    ngOnInit(): void {
        this.isLoggedIn = this.authService.isLoggedIn();
        this.isAdmin = this.authService.isAdmin();
        this.cargarListasPublicas();
    }

    // Trae las listas que otros usuarios han decidido compartir.
    cargarListasPublicas(): void {
        this.cargando = true;
        this.listaService.getListasPublicas().subscribe({
            next: (data) => {
                this.listas = data;
                this.cargando = false;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error al cargar listas públicas', err);
                this.cargando = false;
                this.cdr.detectChanges();
            }
        });
    }

    // Hace una copia de la lista pública para que tú la tengas en tus listas privadas.
    copiarLista(id: number): void {
        this.listaService.copiarLista(id).subscribe({
            next: () => {
                this.mostrarMensaje('¡Lista copiada con éxito! Puedes verla en "Mis Listas".', 'success');
                // Opcional: Redirigir tras unos segundos o dejar que el usuario navegue
                setTimeout(() => this.router.navigate(['/mis-listas']), 2000);
            },
            error: (err) => {
                console.error('Error al copiar lista', err);
                this.mostrarMensaje('No se pudo copiar la lista. Inténtalo de nuevo.', 'danger');
            }
        });
    }
    // Quita una lista de la sección pública (solo para administradores).
    eliminarDeListasPublicas(codLista: number): void {
        this.listaService.eliminarDeListasPublicas(codLista).subscribe({
            next: () => {
                this.mostrarMensaje('¡Lista eliminada con éxito!', 'success');
                this.cargarListasPublicas();
            },
            error: (err) => {
                console.error('Error al eliminar lista', err);
                this.mostrarMensaje('No se pudo eliminar la lista. Inténtalo de nuevo.', 'danger');
            }
        });
    }
    // Enseña una alerta arriba de la pantalla.
    mostrarMensaje(msg: string, tipo: 'success' | 'danger'): void {
        this.mensaje = msg;
        this.tipoMensaje = tipo;
        this.cdr.detectChanges();
        setTimeout(() => {
            this.mensaje = null;
            this.cdr.detectChanges();
        }, 5000);
    }

    // Calcula cuánto cuesta comprar todo lo de esa lista pública.
    getListaTotal(lista: ListaDetalle): number {
        if (!lista || !lista.productos) return 0;
        return lista.productos.reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);
    }
}
