// NUEVO: Importamos OnDestroy de Angular
import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, signal } from '@angular/core';
import { Habitacion } from '../../services/habitacion';
import { ModalCheckinComponent } from '../modal-checkin/modal-checkin';
import { ModalGestion } from '../modal-gestion/modal-gestion';
import { CorteCajaComponent } from '../corte-caja/corta-caja';
// NUEVO: Importamos las herramientas reactivas para el reloj
import { interval, Subscription } from 'rxjs';
import { EstadisticasComponent } from '../estadisticas/estadiiticas';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [ModalCheckinComponent, ModalGestion, CorteCajaComponent, EstadisticasComponent],
  templateUrl: './mapa.html',
  styleUrl: './mapa.css'
})
export class MapaComponent implements OnInit {
  habitaciones: any[] = [];
  mostrarCorte = false;
  mostrarEstadisticas = false;
  
  // 1. Mantenemos tu Signal original
  habitacionSeleccionada = signal<any>(null);
  
  // 2. Control exclusivo para el modal de gestión
  mostrarModalGestion = false;

  private habitacionService = inject(Habitacion);
  private cdr = inject(ChangeDetectorRef);

  // NUEVO: Variable para guardar nuestro temporizador
  private relojSubscripcion?: Subscription;

  ngOnInit(): void {
    this.cargarHabitacionesDesdeBackend();
    this.iniciarReloj(); // ⬅️ NUEVO: Encendemos el reloj al iniciar el componente
  }

  // NUEVO: Limpiamos el reloj cuando salimos de la pantalla para no gastar memoria
  ngOnDestroy(): void {
    if (this.relojSubscripcion) {
      this.relojSubscripcion.unsubscribe();
    }
  }

  cargarHabitacionesDesdeBackend(): void {
    this.habitacionService.obtenerHabitaciones().subscribe({
      next: (datosQueLlegan: any[]) => {
        // 👇 NUEVO: Imprimimos los datos en la consola para ver qué traen
        console.log('Habitaciones desde el backend:', datosQueLlegan);
        this.habitaciones = datosQueLlegan;
        this.cdr.markForCheck(); 
      },
      error: (error: any) => {
        console.error('Error al cargar habitaciones en el mapa:', error);
      }
    });
  }

  // 3. UNIFICAMOS LA LÓGICA DEL CLICK AQUÍ
 manejarClickHabitacion(hab: any): void {
    if (hab.estado === 'disponible') {
      this.habitacionSeleccionada.set(hab);
    } else if (hab.estado === 'ocupada') {
      this.habitacionSeleccionada.set(hab);
      this.mostrarModalGestion = true;
    } else if (hab.estado === 'limpieza') {
      
      // Confirmación de limpieza terminada
      if (confirm(`¿La habitación ${hab.numero} ya está limpia y lista para usarse?`)) {
        this.cambiarEstadoHabitacion(hab._id, 'disponible');
      }

    } else if (hab.estado === 'mantenimiento') {
      
      // Confirmación de mantenimiento terminado
      if (confirm(`¿El mantenimiento de la habitación ${hab.numero} ha finalizado?`)) {
        this.cambiarEstadoHabitacion(hab._id, 'disponible');
      }
      
    }
  }

  // Nueva función para procesar el cambio y recargar el mapa
  cambiarEstadoHabitacion(id: string, nuevoEstado: string) {
    this.habitacionService.actualizarEstado(id, nuevoEstado).subscribe({
      next: () => {
        // Si todo sale bien, recargamos las habitaciones para ver el cambio a blanco
        this.cargarHabitacionesDesdeBackend();
      },
      error: (err: any) => {
        console.error('Error al cambiar el estado de la habitación:', err);
        alert('Hubo un error al actualizar el estado.');
      }
    });
  }

  cerrarModalGestion() {
    this.mostrarModalGestion = false;
    this.habitacionSeleccionada.set(null);
  }

  manejarRecarga() {
    this.cerrarModalGestion();
    this.cargarHabitacionesDesdeBackend(); 
  }
  // ==========================================
  // NUEVO: LÓGICA DEL TEMPORIZADOR DINÁMICO
  // ==========================================
  iniciarReloj() {
    // interval(1000) hace que este código se ejecute cada 1 segundo (1000 milisegundos)
    this.relojSubscripcion = interval(1000).subscribe(() => {
      let hayCambios = false;

      this.habitaciones.forEach(hab => {
        // Solo restamos tiempo a las ocupadas que tengan la variable tiempoRestante
        if (hab.estado === 'ocupada' && hab.tiempoRestante) {
          
          // Separamos el texto "02:30:00" o "02:30" en números
          const partes = hab.tiempoRestante.split(':');
          let h = parseInt(partes[0] || '0', 10);
          let m = parseInt(partes[1] || '0', 10);
          let s = parseInt(partes[2] || '0', 10);

          // Si ya llegó a cero, lo marcamos y nos saltamos la resta
          if (h === 0 && m === 0 && s === 0) {
            hab.tiempoAgotado = true;
            return;
          }

          // Restamos 1 segundo
          s--;
          if (s < 0) { s = 59; m--; }
          if (m < 0) { m = 59; h--; }

          // Volvemos a armar el texto con ceros a la izquierda (ej. "01:09:59")
          hab.tiempoRestante = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
          
          // Bandera visual: ¿Faltan menos de 15 minutos y 0 horas?
          hab.porTerminar = (h === 0 && m < 15);
          
          hayCambios = true;
        }
      });

      // Si algún tiempo cambió, le decimos a Angular que refresque la pantalla
      if (hayCambios) {
        this.cdr.markForCheck();
      }
    });
  }
}