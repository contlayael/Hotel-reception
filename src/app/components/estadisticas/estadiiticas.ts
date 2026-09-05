import { Component, inject, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegistroService } from '../../services/registro'; 

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.html',
})
export class EstadisticasComponent implements OnInit {
  @Output() cerrar = new EventEmitter<void>();
  
  private registroService = inject(RegistroService);
  private cdr = inject(ChangeDetectorRef); 

  stats: any = null;
  cargando = true;

  ngOnInit() {
    this.cargarEstadisticas();
  }

  cargarEstadisticas() {
    this.registroService.obtenerEstadisticas().subscribe({
      next: (res) => {
        this.stats = res;
        this.cargando = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        console.error('Error al cargar estadísticas:', err);
        alert('Hubo un error al cargar los datos.');
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Función para calcular el porcentaje de las barras visuales
  calcularPorcentaje(valor: number): number {
    if (!this.stats || this.stats.totalRegistros === 0) return 0;
    return Math.round((valor / this.stats.totalRegistros) * 100);
  }

  cerrarModal() {
    this.cerrar.emit();
  }
}