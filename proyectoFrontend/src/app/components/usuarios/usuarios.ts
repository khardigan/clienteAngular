import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Usuario } from '../../models/usuario';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule, HttpClientModule],
    templateUrl: './usuarios.html',
    styleUrls: ['./usuarios.css']
})
export class UsuariosComponent implements OnInit {
    usuarios: Usuario[] = [];
    API = 'https://localhost:8443/usuarios';
    basicUser = 'admin';
    basicPass = '1234';

    constructor(private http: HttpClient, private cd: ChangeDetectorRef) { }

    ngOnInit(): void {
        const headers = new HttpHeaders({
            'Authorization': 'Basic ' + btoa(this.basicUser + ':' + this.basicPass)
        });

        this.http.get<Usuario[]>(this.API, { headers })
            .subscribe({
                next: res => {
                    // Aquí simplemente asignamos la respuesta
                    this.usuarios = res;
                    this.cd.detectChanges();
                },
                error: err => console.error('Error al obtener usuarios:', err)
            });
    }
}
