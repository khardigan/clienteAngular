import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Perfil, PerfilService } from '../../services/perfil';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './perfil.html',
  styleUrls: ['./perfil.css']
})
export class PerfilComponent implements OnInit {

  perfil: Perfil | null = null;

  constructor(private perfilService: PerfilService, private cd: ChangeDetectorRef) {}

  ngOnInit(): void {
    const usuarioId = Number(localStorage.getItem('id'));
    if (usuarioId) {
          this.perfilService.obtenerPerfilDesdeToken().subscribe({
        next: (perfil) => {
          this.perfil = perfil;
        },
        error: (err) => {
          console.error("Error cargando perfil:", err);
        }
      });
    }
  }
}

export type { Perfil };