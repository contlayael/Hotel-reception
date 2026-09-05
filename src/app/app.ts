import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MapaComponent } from './components/mapa/mapa';

@Component({
  selector: 'app-root',
  standalone: true,
  // Importamos nuestro nuevo componente aquí para que el HTML lo conozca
  imports: [MapaComponent], 
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  // Queda completamente limpio de lógica, listo para el futuro enrutamiento
  
}