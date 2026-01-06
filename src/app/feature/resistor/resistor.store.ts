import { signal, computed } from '@angular/core';
import { calculateResistanceFromBands } from './resistor.utils';
import { Color } from './resistor.model';

export class ResistorStore {
  bandCount = signal<4 | 5 | 6>(4);
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
