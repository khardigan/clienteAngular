import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ListaService } from '../../services/lista';
import { ListaDetalle } from '../../models/lista';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
})
export class InicioComponent implements OnInit {

  listas: ListaDetalle[] = [];
  cargando = true;

  constructor(
    private listaService: ListaService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.cargarListasPublicas();
  }

  cargarListasPublicas(): void {
    this.cargando = true;
    this.listaService.getListasPublicas().subscribe({
      next: (data) => {
        this.listas = data.slice(0, 3);
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
}