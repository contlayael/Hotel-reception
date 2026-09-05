import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroService } from '../../services/registro'; 

@Component({
  selector: 'app-modal-gestion',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Fondo oscuro semi-transparente -->
    <div class="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50">
      
      <!-- Contenedor del Modal -->
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        
        <!-- Botón de Cerrar (X) -->
        <button 
          (click)="cerrarModal()" 
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-xl">
          &times;
        </button>

        <!-- Encabezado -->
        <h2 class="text-2xl font-extrabold text-slate-800 mb-2">
          Gestión de Habitación {{ habitacion?.numero }}
        </h2>
        <p class="text-slate-500 mb-6">
          Selecciona la acción que deseas realizar con esta estancia.
        </p>

        <!-- Botones de Acción -->
        <div class="flex flex-col gap-4">
          
          <button 
            type="button"
            (click)="agregarHora()"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors flex justify-between items-center">
            <span>⏳ Agregar 1 Hora Extra</span>
            <span class="bg-blue-600 py-1 px-2 rounded text-sm">+ $100.00</span>
          </button>

          <button 
            type="button"
            (click)="hacerCheckout()"
            class="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors flex justify-between items-center">
            <span>🚪 Finalizar Estancia</span>
            <span class="text-slate-300 text-sm">Check-out</span>
          </button>

        </div>
      </div>
    </div>
  `
})
export class ModalGestion {
  @Input() habitacion: any = null; 
  
  @Output() cerrar = new EventEmitter<void>();
  @Output() recargar = new EventEmitter<void>();

  constructor(private registroService: RegistroService) {}

  cerrarModal() {
    this.cerrar.emit();
  }

  agregarHora() {
    if (!this.habitacion || !this.habitacion._id) return;

    this.registroService.agregarTiempoExtra(this.habitacion._id).subscribe({
      next: (res) => {
        alert('Tiempo extra agregado con éxito (+ $100)');
        this.recargar.emit(); 
      },
      error: (err) => {
        alert('Error al agregar tiempo extra');
        console.error(err);
      }
    });
  }

  hacerCheckout() {
    if (!this.habitacion || !this.habitacion._id) return;

    if (confirm('¿Estás seguro de finalizar esta estancia? La habitación pasará a limpieza.')) {
      this.registroService.finalizarEstancia(this.habitacion._id).subscribe({
        next: (res) => {
          alert('Estancia finalizada. Habitación en limpieza.');
          this.recargar.emit(); 
        },
        error: (err) => {
          alert('Error al finalizar la estancia');
          console.error(err);
        }
      });
    }
  }
}