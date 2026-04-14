import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListaService } from '../../services/lista';
import { ProductoService } from '../../services/producto';
import { ListaDetalle, IntegranteLista, ProductoEstado } from '../../models/lista';

@Component({
    selector: 'app-lista',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './lista.html',
    styleUrls: ['./lista.css']
})
export class ListaComponent implements OnInit {
    listas: ListaDetalle[] = [];
    cargando = true;
    errorStr = '';

    // Estados específicos por lista (índice por codLista)
    constructor(
        private listaService: ListaService,
        private productoService: ProductoService,
        private cdr: ChangeDetectorRef
    ) { }

    ngOnInit(): void {
        this.cargarListas();
    }

    /**
     * Devuelve las listas ordenadas: las incompletas primero y las completadas al final.
     */
    get listasOrdenadas(): ListaDetalle[] {
        return [...this.listas].sort((a, b) => {
            const aComp = this.estaListaCompletada(a) ? 1 : 0;
            const bComp = this.estaListaCompletada(b) ? 1 : 0;
            return aComp - bComp;
        });
    }

    /**
     * Comprueba si una lista está marcada como completada.
     */
    estaListaCompletada(lista: ListaDetalle): boolean {
        return lista.productos.length > 0 && lista.productos.every(p => p.comprado);
    }

    /**
     * Descarga del backend todas las listas en las que participa el usuario.
     */
    cargarListas(): void {
        this.cargando = true;
        this.listaService.obtenerMisListas().subscribe({
            next: (data) => {
                setTimeout(() => {
                    this.listas = data || [];
                    this.cargando = false;
                    this.cdr.detectChanges();
                }, 1000);
            },
            error: (err) => {
                this.errorStr = 'No se pudieron cargar tus listas.';
                this.cargando = false;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Organiza los integrantes para mostrarlos en el HTML.
     */
    obtenerIntegrantes(lista: ListaDetalle): IntegranteLista[] {
        const integrantes: IntegranteLista[] = [];
        integrantes.push({ id: lista.usuarioDuenoId, nick: lista.nombreDuenoNick, esDueno: true });
        if (lista.usuariosCompartida) {
            lista.usuariosCompartida.forEach(u => {
                integrantes.push({ id: u.id, nick: u.nick, esDueno: false });
            });
        }
        return integrantes;
    }

    /**
     * Cambia el estado de un producto y lo sincroniza.
     */
    cambiarEstadoComprado(listaId: number, producto: ProductoEstado): void {
        const nuevoEstado = !producto.comprado;
        producto.comprado = nuevoEstado;
        this.cdr.detectChanges();

        this.listaService.cambiarEstadoComprado(listaId, producto.id, nuevoEstado).subscribe({
            next: () => { },
            error: (err) => {
                producto.comprado = !nuevoEstado;
                this.cdr.detectChanges();
            }
        });
    }

    /**
     * Borra una lista completa.
     */
    eliminarLista(listaId: number): void {
        if (!confirm('¿Seguro que quieres eliminar esta lista?')) return;
        this.listaService.eliminarLista(listaId).subscribe({
            next: () => {
                this.listas = this.listas.filter(l => l.codLista !== listaId);
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error al eliminar lista', err)
        });
    }

    /**
     * Calcula el total de la lista.
     */
    getListaTotal(lista: ListaDetalle): number {
        if (!lista || !lista.productos) return 0;
        return lista.productos.reduce((acc, p) => acc + (p.precio * (p.cantidad || 1)), 0);
    }


}