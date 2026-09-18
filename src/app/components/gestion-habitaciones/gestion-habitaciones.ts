import { Component, inject, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Habitacion } from '../../services/habitacion';

@Component({
  selector: 'app-gestion-habitaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-habitaciones.html'
})
export class GestionHabitacionesComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  @Output() recargarMapa = new EventEmitter<void>();

  private habitacionService = inject(Habitacion);
  private cdr = inject(ChangeDetectorRef); //

  habitaciones: any[] = [];
  cargando = true;
  guardando = false;

  // Variables para el formulario
  nuevoNumero = '';
  nuevoTipo = 'cochera'; // cochera, doble, jacuzzi

  ngOnInit() {
    this.cargarHabitaciones();
  }

  cargarHabitaciones() {
    this.cargando = true;
    this.habitacionService.obtenerHabitaciones().subscribe({
      next: (datos) => {
        // Ordenamos las habitaciones numéricamente
        this.habitaciones = datos.sort((a: any, b: any) => Number(a.numero) - Number(b.numero));
        this.cargando = false;
        // 3. ¡El truco de magia! Le avisamos a la pantalla que se dibuje.
        this.cdr.detectChanges();
      },
      error: () => {
        alert('Error al cargar la lista de habitaciones.');
        this.cargando = false;
      }
    });
  }

  agregarHabitacion() {
    if (!this.nuevoNumero.trim()) return;
    this.guardando = true;

    this.habitacionService.crearHabitacion({ numero: this.nuevoNumero, tipo: this.nuevoTipo }).subscribe({
      next: () => {
        this.nuevoNumero = ''; // Limpiamos el campo
        this.cargarHabitaciones(); // Recargamos la lista
        this.recargarMapa.emit(); // Avisamos al mapa que hay un cuarto nuevo
        this.guardando = false;
      },
      error: (err) => {
        alert(err.error.mensaje || 'Error al crear la habitación.');
        this.guardando = false;
      }
    });
  }

  borrarHabitacion(id: string, numero: string) {
    if (confirm(`⚠️ CUIDADO: ¿Estás seguro de eliminar PERMANENTEMENTE la habitación ${numero}?`)) {
      this.habitacionService.eliminarHabitacion(id).subscribe({
        next: () => {
          this.cargarHabitaciones();
          this.recargarMapa.emit();
        },
        error: () => alert('Error al eliminar la habitación.')
      });
    }
  }
}