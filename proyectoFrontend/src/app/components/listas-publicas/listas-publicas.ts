import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListaService } from '../../services/lista';
import { ListaDetalle } from '../../models/lista';
import { Router } from '@angular/router';

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
        private router: Router
    ) { }

    ngOnInit(): void {
        this.cargarListasPublicas();
    }

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

    mostrarMensaje(msg: string, tipo: 'success' | 'danger'): void {
        this.mensaje = msg;
        this.tipoMensaje = tipo;
        this.cdr.detectChanges();
        setTimeout(() => {
            this.mensaje = null;
            this.cdr.detectChanges();
        }, 5000);
    }

    getListaTotal(lista: ListaDetalle): number {
        if (!lista || !lista.productos) return 0;
        return lista.productos.reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);
    }
}
