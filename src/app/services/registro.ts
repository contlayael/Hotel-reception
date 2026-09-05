import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RegistroService {
  // Apuntamos al backend que acabamos de revivir
  private apiUrl = 'http://localhost:5000/api/registros';

  constructor(private http: HttpClient) {}

  // Agregar tiempo extra (recibe el ID de la habitación)
  agregarTiempoExtra(habitacionId: string) {
    return this.http.put(`${this.apiUrl}/${habitacionId}/tiempo-extra`, {});
  }

  // Finalizar la estancia / Check-out (recibe el ID de la habitación)
  finalizarEstancia(habitacionId: string) {
    return this.http.put(`${this.apiUrl}/${habitacionId}/finalizar`, {});
  }

  // Obtener el corte de caja por fecha (recibe 'YYYY-MM-DD')
  // Obtener el corte de caja por fecha y turno
  obtenerCorte(fecha: string, turno: string) {
    return this.http.get<any>(`${this.apiUrl}/corte?fecha=${fecha}&turno=${turno}`);
  }

  // Obtener estadísticas globales
  obtenerEstadisticas() {
    return this.http.get<any>(`${this.apiUrl}/estadisticas`);
  }
}