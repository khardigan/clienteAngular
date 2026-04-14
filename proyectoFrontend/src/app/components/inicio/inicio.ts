import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
})
/**
 * Componente de la página de inicio.
 * Muestra la presentación principal y los supermercados disponibles.
 */
export class InicioComponent {
  constructor() { }
}