import { Component, inject, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
// Asegúrate de que la ruta a tu servicio de registro sea la correcta
import { RegistroService } from '../../services/registro'; 

@Component({
  selector: 'app-corte-caja',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './corte-caja.html',
})
export class CorteCajaComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  
  private registroService = inject(RegistroService);
  private cdr = inject(ChangeDetectorRef);

  datosCorte: any = null;
  cargando = true;
// NUEVO: Variable para guardar la fecha en formato YYYY-MM-DD (Inicia con hoy)
  fechaSeleccionada: string = '';
// NUEVO: Variable para el turno. Inicia en 'dia' (puedes programarlo para que detecte la hora local después si gustas)
  turnoSeleccionado: string = 'dia';

  ngOnInit() {
    this.fechaSeleccionada = this.obtenerFechaLocal();
    this.cargarCorte();
  }

  //Agrega esta nueva función que extrae el día, mes y año de tu zona horaria
  obtenerFechaLocal(): string {
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, '0');
    const dd = String(hoy.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  cargarCorte() {
    this.cargando = true; // Mostramos el mensaje de "Calculando..." mientras busca

    // Ahora pasamos la fecha y el turno
    this.registroService.obtenerCorte(this.fechaSeleccionada, this.turnoSeleccionado).subscribe({
      next: (res) => {
        this.datosCorte = res;
        this.cargando = false;
        // 3. Le decimos a Angular: "¡Oye, ya llegaron los datos, actualiza el HTML!"
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar el corte de caja:', err);
        alert('Hubo un error al generar el reporte.');
        this.cargando = false;
      }
    });
  }

  // NUEVO: Función que se dispara cuando eliges otro día en el calendario
  cambiarFecha(event: any) {
    this.fechaSeleccionada = event.target.value;
    this.cargarCorte(); // Volvemos a pedir los datos a la base de datos
  }

  // NUEVO: Función para cambiar el turno
  cambiarTurno(event: any) {
    this.turnoSeleccionado = event.target.value;
    this.cargarCorte();
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}