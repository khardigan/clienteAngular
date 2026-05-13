import { HttpClient, HttpHeaders } from '@angular/common/http'; // IMPORTANTE: Añade HttpHeaders aquí
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://localhost:8443/usuarios/login';
  private registerUrl = 'https://localhost:8443/usuarios/registrar';
  // Observable para que otros componentes sepan cuando cambia el estado de la sesión
  public loginStatus$ = new BehaviorSubject<boolean>(this.isLoggedIn());
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
          if (res.nombre) {
            localStorage.setItem('nombre', res.nombre);
          }
          if (res.email) {
            localStorage.setItem('email', res.email);
          }
          this.loginStatus$.next(true); // Actualizamos el estado de la sesión
          this.router.navigate(['/perfil']); // Redirigimos al perfil después de login exitoso
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

  getId(): number | null {
    const id = localStorage.getItem('id');
    return id ? parseInt(id, 10) : null;
  }


  register(userData: any) {
    // El backend espera el campo 'contraseña' con ñ según el DTO
    const payload = {
      nombre: userData.nombre,
      email: userData.email,
      contraseña: userData.password,
      rol: 'USER', // Rol por defecto
      fechaRegistro: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD
    };

    return this.http.post<any>(this.registerUrl, payload).pipe(
      tap(res => {
        // Ya no hacemos login automático aquí.
        // El usuario deberá confirmar su email e ir a login manualmente.
      })
    );
  }
  geUserById(id: number) {
    const url = `https://localhost:8443/usuarios/${id}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.get<any>(url, { headers });
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('id');
    localStorage.removeItem('nombre');
    localStorage.removeItem('email');
    this.loginStatus$.next(false);
    this.router.navigate(['/login']);
  }

  getNombre(): string | null {
    return localStorage.getItem('nombre');
  }

  getEmail(): string | null {
    return localStorage.getItem('email');
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

  enviarComentario(comentario: string) {
    const id = this.getId();
    if (!id) return null;
    const url = `https://localhost:8443/usuarios/${id}/comentarios`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.getToken()}`
    });
    return this.http.post<any>(url, { comentario }, { headers });
  }

  solicitarRecuperacion(nombre: string, email: string) {
    const url = `https://localhost:8443/usuarios/recuperar`;
    return this.http.post<any>(url, { nombre, email });
  }

  resetearPassword(token: string, password: string, nombre: string, email: string) {
    const url = `https://localhost:8443/usuarios/reset-password`;
    return this.http.post<any>(url, { token, password, nombre, email });
  }

  verificarEmail(token: string) {
    const url = `https://localhost:8443/usuarios/verificar?token=${token}`;
    return this.http.get<any>(url);
  }


}

