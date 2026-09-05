// 1. Agregamos OnChanges y SimpleChanges a las importaciones
import { Component, Input, Output, EventEmitter, signal, inject, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Habitacion } from '../../services/habitacion';

@Component({
  selector: 'app-modal-checkin',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './modal-checkin.html',
  styleUrl: './modal-checkin.css'
})
export class ModalCheckinComponent implements OnChanges {
  @Input() habitacion: any = null;
  @Output() alCerrar = new EventEmitter<void>();
  @Output() alGuardarExitoso = new EventEmitter<any>();

  private habitacionService = inject(Habitacion);

  pasoActual = signal<number>(1);
  estaGuardando = signal<boolean>(false);

  datosFormulario = {
    tipoTiempo: '2horas',
    tipoLlegada: 'auto',
    toallasEntregadas: 2,
    marca: '',
    color: '',
    placas: '',
    metodoPago: 'efectivo'
  };

  // ==========================================
  // NUEVO: Reaccionar cuando se abre el modal
  // ==========================================
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['habitacion'] && this.habitacion) {
      // Si la habitación es jacuzzi, por defecto ponemos 4 horas para evitar errores
      if (this.habitacion.tipo === 'jacuzzi') {
        this.datosFormulario.tipoTiempo = '4horas';
      } else {
        this.datosFormulario.tipoTiempo = '2horas';
      }
    }
  }

  // ==========================================
  // NUEVO: Motor de cálculo de precios
  // ==========================================
  calcularCostoBase(): number {
    const esJacuzzi = this.habitacion?.tipo === 'jacuzzi';
    const tiempo = this.datosFormulario.tipoTiempo;

    if (esJacuzzi) {
      if (tiempo === '4horas') return 450;
      if (tiempo === 'noche') return 650;
    } else {
      if (tiempo === '2horas') return 200;
      if (tiempo === '4horas') return 300;
      if (tiempo === 'noche') return 400;
    }
    return 0; // Por si hay algún error
  }

  irAlSiguiente(): void {
    if (this.pasoActual() < 3) {
      this.pasoActual.update(p => p + 1);
    }
  }

  irAlAnterior(): void {
    if (this.pasoActual() > 1) {
      this.pasoActual.update(p => p - 1);
    }
  }

  cerrarModal(): void {
    this.pasoActual.set(1); 
    this.alCerrar.emit();
  }

  esFormularioValido(): boolean {
    if (this.datosFormulario.toallasEntregadas === null || this.datosFormulario.toallasEntregadas < 0) {
      return false;
    }

    if (this.datosFormulario.tipoLlegada === 'auto' || this.datosFormulario.tipoLlegada === 'moto') {
      if (!this.datosFormulario.placas.trim() || !this.datosFormulario.marca.trim() || !this.datosFormulario.color.trim()) {
        return false;
      }
    }

    return true; 
  }

  procesarCheckIn(): void {
    if (!this.esFormularioValido() || this.estaGuardando()) return;

    this.estaGuardando.set(true); 

    const payloadFinal = {
      habitacionId: this.habitacion._id,
      // INYECTAMOS EL PRECIO EXACTO AL BACKEND
      costoBase: this.calcularCostoBase(), 
      ...this.datosFormulario
    };
    
    this.habitacionService.registrarCheckIn(payloadFinal).subscribe({
      next: (respuesta) => {
        console.log('✅ Check-in guardado con éxito en MongoDB:', respuesta);
        this.estaGuardando.set(false);
        this.alGuardarExitoso.emit(respuesta); 
        this.cerrarModal(); 
      },
      error: (error) => {
        console.error('❌ Error al guardar en el backend:', error);
        alert('Ups, hubo un problema al guardar. Revisa la consola para más detalles.');
        this.estaGuardando.set(false);
      }
    });
  }
}