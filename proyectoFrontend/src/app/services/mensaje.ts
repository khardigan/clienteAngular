import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

export interface Mensaje {
  texto: string;
  tipo: 'success' | 'error' | 'info';
}

export interface Confirmacion {
  pregunta: string;
  callback: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class MensajeService {

  private mensajeSubject = new BehaviorSubject<Mensaje | null>(null);
  mensaje$ = this.mensajeSubject.asObservable();

  private confirmacionSubject = new BehaviorSubject<Confirmacion | null>(null);
  confirmacion$ = this.confirmacionSubject.asObservable();

  constructor() { }

  /**
   * Muestra un mensaje de éxito que desaparece solo
   */
  mostrarSuccess(texto: string) {
    this.mostrar({ texto, tipo: 'success' });
  }

  mostrarInfo(texto: string) {
    this.mostrar({ texto, tipo: 'info' });
  }
  /**
   * Muestra un mensaje de error
   */
  mostrarError(texto: string) {
    this.mostrar({ texto, tipo: 'error' });
  }

  /**
   * Abre un cuadro de diálogo para confirmar una acción
   */
  confirmar(pregunta: string, alConfirmar: () => void) {
    this.confirmacionSubject.next({ pregunta, callback: alConfirmar });
  }

  aceptarConfirmacion() {
    const actual = this.confirmacionSubject.value;
    if (actual) {
      actual.callback();
      this.cancelarConfirmacion();
    }
  }

  cancelarConfirmacion() {
    this.confirmacionSubject.next(null);
  }

  private mostrar(m: Mensaje) {
    this.mensajeSubject.next(m);
    const tiempo = m.tipo === 'error' ? 5000 : 3000;
    setTimeout(() => {
      if (this.mensajeSubject.value === m) {
        this.limpiar();
      }
    }, tiempo);
  }

  limpiar() {
    this.mensajeSubject.next(null);
  }
}
