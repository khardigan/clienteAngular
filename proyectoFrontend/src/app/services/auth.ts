import { HttpClient, HttpHeaders } from '@angular/common/http'; // IMPORTANTE: Añade HttpHeaders aquí
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:8443/usuarios/login';

  constructor(private http: HttpClient, private router: Router) { }

  login(credentials: any) {
    // 1. Enviamos el POST con el JSON
    return this.http.post<any>(this.apiUrl, credentials).pipe(
      tap(res => {
        if (res && res.token) {
          this.saveToken(res.token); // Guardamos el JWT que nos da el servidor
          if (res.id) {
            localStorage.setItem('id', String(res.id));
          }
        }
      })
    );
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getRole(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.rol || payload.role;
    } catch (e) {
      return null;
    }
  }

  isAdmin(): boolean {
    return this.getRole() === 'ADMIN';
  }
}