import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // Necesario para el pipe async
import { MapaComponent } from './components/mapa/mapa';
import { LoginComponent } from './components/login/login';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  // Importamos ambos componentes
  imports: [CommonModule, MapaComponent, LoginComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  authService = inject(AuthService);
}