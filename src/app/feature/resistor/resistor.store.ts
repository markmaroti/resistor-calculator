import { Injectable, signal, computed } from '@angular/core';
import { calculateResistanceFromBands } from './resistor.utils';
import { BandCount, Color } from './resistor.model';

@Injectable()
export class ResistorStore {
  bandCount = signal<BandCount>(4);
  digit1 = signal<Color>(Color.Brown);
  digit2 = signal<Color>(Color.Black);
  digit3 = signal<Color>(Color.Black);
  multiplier = signal<Color>(Color.Black);
  tolerance = signal<Color>(Color.Gold);
  tcr = signal<Color>(Color.Brown);

  resistance = computed(() =>
    calculateResistanceFromBands({
      bandCount: this.bandCount(),
      digit1: this.digit1(),
      digit2: this.digit2(),
      digit3: this.digit3(),
      multiplier: this.multiplier(),
      tolerance: this.tolerance(),
      tcr: this.tcr(),
    })
  );
}
