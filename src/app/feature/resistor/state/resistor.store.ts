import { Injectable, computed, signal } from '@angular/core';
import { ResistorDomainService } from '../services/resistor.service';
import { BandCount, Color } from '../resistor.model';

@Injectable()
export class ResistorStore {
  public bandCount = signal<BandCount>(4);
  public digit1 = signal<Color>(Color.Brown);
  public digit2 = signal<Color>(Color.Black);
  public digit3 = signal<Color>(Color.Black);
  public multiplier = signal<Color>(Color.Black);
  public tolerance = signal<Color>(Color.Gold);
  public tcr = signal<Color>(Color.Brown);

  public resistance = computed(() =>
    this.domain.calculateResistanceFromBands({
      bandCount: this.bandCount(),
      digit1: this.digit1(),
      digit2: this.digit2(),
      digit3: this.digit3(),
      multiplier: this.multiplier(),
      tolerance: this.tolerance(),
      tcr: this.tcr(),
    }),
  );

  constructor(private readonly domain: ResistorDomainService) {}
}
