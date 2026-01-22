import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  fechaRegistro: string;
  idPerfil: number;
  rol: string;
  listaProductosSubidos: any[];
  listasCompartidas: any[];
  listasCreadas: any[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  template: `
    <div class="container mt-4">
      <h1>Lista de Usuarios</h1>
      <p>Usuarios length: {{ usuarios.length }}</p>
      <ul>
        <li *ngFor="let u of usuarios">
          {{ u.id }} - {{ u.nombre }} - {{ u.email }} - {{ u.rol }}
        </li>
      </ul>
    </div>
  `
})
export class App implements OnInit {
  usuarios: Usuario[] = [];
  API = 'http://localhost:8080/usuarios';
  token = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbCI6IkFETUlOIiwiaWQiOjEsImlhdCI6MTc2OTA4MTU5MCwiZXhwIjoxNzY5MDg1MTkwfQ.czGq_hQT22s76sQWMHj8Ni0uFz-SN6Tv1q6FYDvJxd8';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>(this.API, { headers: new HttpHeaders({'Authorization':'Bearer ' + this.token}) })
      .subscribe({
        next: res => {
          console.log('Datos recibidos del backend:', res);

          // Normalizamos siempre a array
          let usuariosArray: Usuario[] = [];

          if (Array.isArray(res)) {
            usuariosArray = res.map(u => this.mapToUsuario(u));
          } else if (typeof res === 'object' && res !== null) {
            // si es un objeto, lo convertimos en array de 1
            usuariosArray = [this.mapToUsuario(res)];
          }

          this.usuarios = usuariosArray;
          console.log('Usuarios listos:', this.usuarios);
        },
        error: err => console.error('Error al obtener usuarios:', err)
      });
  }

  // Función para mapear datos a la interface Usuario
  private mapToUsuario(u: any): Usuario {
    return {
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      fechaRegistro: u.fechaRegistro,
      idPerfil: u.idPerfil,
      rol: u.rol,
      listaProductosSubidos: u.listaProductosSubidos || [],
      listasCompartidas: u.listasCompartidas || [],
      listasCreadas: u.listasCreadas || []
    };
  }
}
