import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductoService } from '../../services/producto';
import { Producto } from '../../models/producto';

@Component({
    selector: 'app-busqueda',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './busqueda.html',
    styleUrls: ['./busqueda.css']
})
/**
 * Componente para realizar búsquedas de productos.
 * Permite filtrar por texto y muestra los resultados en tiempo real.
 */
export class BusquedaComponent {

    query: string = '';
    productos: Producto[] = [];
    busquedaRealizada: boolean = false;

    constructor(
        private productoService: ProductoService,
        private cd: ChangeDetectorRef
    ) { }

    // Ejecuta la búsqueda llamando al backend 
    onSearch(): void {
        this.productoService.buscarProductos(this.query).subscribe({
            next: (res) => {
                this.productos = res;
                this.busquedaRealizada = true; // Siempre mostramos la zona de resultados al buscar
                this.cd.detectChanges();
            },
            error: (err) => console.error('Error en búsqueda:', err)
        });
    }

    // Para las sugerencias rápidas
    buscarSugerencia(termino: string): void {
        this.query = termino;
        this.onSearch();
    }
}