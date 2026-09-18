import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef); // ⬅️ NUEVO: Inyectamos el actualizador de pantalla

  username = '';
  password = '';
  cargando = false;
  error = '';

  iniciarSesion() {
    if (!this.username || !this.password) {
      this.error = 'Por favor, completa ambos campos.';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges(); // Forzamos a que aparezca el "Verificando..."

    this.authService.login(this.username, this.password).subscribe({
      next: () => {
        this.cargando = false;
        // El auth.ts ya avisó que hay sesión, Angular ocultará esta pantalla mágicamente
        // Si todo sale bien, Angular cambia de pantalla automáticamente
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.cargando = false;
       // Si falla, mostramos el error exacto del servidor
        this.error = err.error?.mensaje || 'Error 500: Falló la conexión con el servidor.';
        this.cdr.detectChanges(); // ⬅️ NUEVO: Forzamos a que el botón vuelva a la normalidad
      }
    });
  }
}