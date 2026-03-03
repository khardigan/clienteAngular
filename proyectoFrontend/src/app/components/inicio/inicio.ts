import { Component, AfterViewInit, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './inicio.html',
  styleUrls: ['./inicio.css'],
})
/**
 * Componente de la página de inicio.
 * Se encarga de mostrar la bienvenida y gestionar las animaciones de entrada al hacer scroll
 * mediante el uso de IntersectionObserver.
 */
export class InicioComponent implements AfterViewInit {

  @ViewChildren('animatedSection') animatedSections!: QueryList<ElementRef>;

  constructor() { }

  ngAfterViewInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          // Optional: Remove class if you want the animation to repeat when scrolling up
          entry.target.classList.remove('in-view');
        }
      });
    }, {
      threshold: 0.1 // Trigger when 10% of the element is visible
    });

    this.animatedSections.forEach(section => {
      observer.observe(section.nativeElement);
    });
  }
}