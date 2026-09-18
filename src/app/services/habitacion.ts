import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Habitacion {
  private apiUrl = 'http://localhost:5000/api/habitaciones';
  // 1. Agregamos la ruta de tu backend que recibe los check-ins
  private registrosUrl = 'http://localhost:5000/api/registros'; 

  private http = inject(HttpClient);

  obtenerHabitaciones(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  // 2. NUEVO MÉTODO: Envía los datos del formulario a Node.js
  registrarCheckIn(datosDelFormulario: any): Observable<any> {
    return this.http.post(this.registrosUrl, datosDelFormulario);
  }

  // Cambiar rápidamente el estado de una habitación
  // Agregamos la nota como parámetro opcional
  // Fíjate que reciba la notaMantenimiento y la meta dentro de las llaves { } al final
  actualizarEstado(id: string, estado: string, notaMantenimiento: string = '') {
    return this.http.put(`${this.apiUrl}/${id}/estado`, { estado, notaMantenimiento });
  }

  // Crear nueva habitación
  crearHabitacion(datos: { numero: string, tipo: string }) {
    return this.http.post(this.apiUrl, datos);
  }

  // Eliminar habitación
  eliminarHabitacion(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}