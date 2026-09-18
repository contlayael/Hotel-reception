import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // NUEVO: Necesario para la caja de texto
import { RegistroService } from '../../services/registro'; 
import { Habitacion } from '../../services/habitacion'; // NUEVO: Para actualizar el estado

@Component({
  selector: 'app-modal-gestion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900 bg-opacity-50 flex justify-center items-center z-50 p-4">
      
      <div class="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        
        <button 
          (click)="cerrarModal()" 
          class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 font-bold text-2xl transition-colors">
          &times;
        </button>

        <h2 class="text-2xl font-extrabold text-slate-800 mb-1">
          Gestión de Habitación {{ habitacion?.numero }}
        </h2>
        <p class="text-sm text-slate-500 mb-6 font-medium">
          Selecciona la acción que deseas realizar con esta estancia.
        </p>

        <div class="flex flex-col gap-3">
          
          <button 
            type="button"
            (click)="agregarHora()"
            class="w-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold py-3 px-4 rounded-xl transition-colors flex justify-between items-center">
            <span class="flex items-center gap-2"><span class="text-xl">⏳</span> Agregar 1 Hora Extra</span>
            <span class="bg-white text-blue-800 py-1 px-2 rounded-md shadow-sm text-xs">+ $100.00</span>
          </button>

          <button 
            type="button"
            (click)="hacerCheckout()"
            class="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors flex justify-between items-center">
            <span class="flex items-center gap-2"><span class="text-xl">🚪</span> Finalizar Estancia</span>
            <span class="text-slate-300 text-xs uppercase tracking-wider">Check-out</span>
          </button>

          <!-- NUEVO: Sección de Mantenimiento -->
          <div class="mt-4 pt-4 border-t border-slate-200">
            <button 
              type="button"
              (click)="mostrarFormMantenimiento = !mostrarFormMantenimiento"
              class="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-xl transition-colors flex justify-center items-center gap-2">
              <span class="text-xl">🛠️</span> Enviar a Mantenimiento
            </button>

            @if (mostrarFormMantenimiento) {
              <div class="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-xl animate-in fade-in slide-in-from-top-2">
                <label class="block text-xs font-bold text-orange-800 uppercase mb-2">Detalles del problema:</label>
                <textarea 
                  [(ngModel)]="notaMantenimiento"
                  rows="3" 
                  placeholder="Ej: Fuga de agua, foco fundido, sábanas rotas..."
                  class="w-full p-3 rounded-lg border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm mb-3">
                </textarea>
                
                <button 
                  (click)="confirmarMantenimiento()"
                  [disabled]="!notaMantenimiento.trim()"
                  class="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold py-2 rounded-lg transition-colors">
                  Confirmar Mantenimiento
                </button>
              </div>
            }
          </div>

        </div>
      </div>
    </div>
  `
})
export class ModalGestion {
  @Input() habitacion: any = null; 
  @Output() cerrar = new EventEmitter<void>();
  @Output() recargar = new EventEmitter<void>();

  private registroService = inject(RegistroService);
  private habitacionService = inject(Habitacion); // Inyectamos servicio de habitaciones

  mostrarFormMantenimiento = false;
  notaMantenimiento = '';

  cerrarModal() {
    this.cerrar.emit();
  }

  agregarHora() {
    if (!this.habitacion || !this.habitacion._id) return;
    this.registroService.agregarTiempoExtra(this.habitacion._id).subscribe({
      next: () => {
        alert('Tiempo extra agregado con éxito (+ $100)');
        this.recargar.emit(); 
      },
      error: (err) => console.error(err)
    });
  }

  hacerCheckout() {
    if (!this.habitacion || !this.habitacion._id) return;
    if (confirm('¿Estás seguro de finalizar esta estancia? La habitación pasará a limpieza.')) {
      this.registroService.finalizarEstancia(this.habitacion._id).subscribe({
        next: () => {
          this.recargar.emit(); 
        },
        error: (err) => console.error(err)
      });
    }
  }

  confirmarMantenimiento() {
    if (!this.habitacion || !this.habitacion._id) return;
    
    // Al mandar a mantenimiento una habitación ocupada, finalizamos la estancia y cambiamos el estado
    if (confirm('¿Finalizar estancia actual y bloquear la habitación por mantenimiento?')) {
      
      // Primero hacemos check-out
      this.registroService.finalizarEstancia(this.habitacion._id).subscribe({
        next: () => {
          // Luego actualizamos el estado a mantenimiento y guardamos la nota
          this.habitacionService.actualizarEstado(this.habitacion._id, 'mantenimiento', this.notaMantenimiento).subscribe({
            next: () => {
              this.recargar.emit();
            },
            error: (err) => console.error('Error al cambiar a mantenimiento', err)
          });
        }
      });
    }
  }
}