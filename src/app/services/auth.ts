import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/auth';

  // Usamos BehaviorSubject para avisarle a Angular en tiempo real si hay sesión o no
  private sesionActiva = new BehaviorSubject<boolean>(this.tieneToken());
  sesionActiva$ = this.sesionActiva.asObservable();

  login(username: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/login`, { username, password }).pipe(
      tap(res => {
        if (res.token) {
          // Guardamos el gafete digital en el navegador
          localStorage.setItem('token', res.token);
          localStorage.setItem('usuario', JSON.stringify(res.usuario));
          // Avisamos que ya hay sesión activa
          this.sesionActiva.next(true);
        }
      })
    );
  }

  logout() {
    // Destruimos el gafete y regresamos a la pantalla de login
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.sesionActiva.next(false);
  }

  tieneToken(): boolean {
    // Retorna true si el token existe, false si no
    return !!localStorage.getItem('token');
  }

  obtenerUsuario() {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  }
}