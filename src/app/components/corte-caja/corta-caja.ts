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
  fechaSeleccionada: string = new Date().toISOString().split('T')[0];

  ngOnInit() {
    this.cargarCorte();
  }

  cargarCorte() {
    this.cargando = true; // Mostramos el mensaje de "Calculando..." mientras busca

    // Le pasamos la fecha elegida al servicio
    this.registroService.obtenerCorte(this.fechaSeleccionada).subscribe({
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

  cerrarModal() {
    this.cerrar.emit();
  }
}