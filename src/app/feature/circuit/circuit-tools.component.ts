import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { OhmsPipe } from '@shared/pipes/ohms.pipe';
import { AmpsPipe } from '@shared/pipes/amps.pipe';
import { VoltsPipe } from '@shared/pipes/volts.pipe';

import { CircuitStore } from '@circuit/state/circuit.store';

import { CircuitTab } from './circuit.model';

const TABS: { key: CircuitTab; label: string }[] = [
  { key: 'series', label: 'Series' },
  { key: 'parallel', label: 'Parallel' },
  { key: 'divider', label: 'Divider' },
];

@Component({
  selector: 'app-circuit-tools',
  templateUrl: './circuit-tools.component.html',
  styleUrl: './circuit-tools.component.scss',
  imports: [RouterLink, ReactiveFormsModule, OhmsPipe, VoltsPipe, AmpsPipe],
  providers: [CircuitStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircuitToolsComponent {
  readonly tabs = TABS;
  readonly store = inject(CircuitStore);

  removeLastResistor(form: 'series' | 'parallel'): void {
    const controls =
      form === 'series'
        ? this.store.seriesForm.controls.resistors
        : this.store.parallelForm.controls.resistors;
    this.store.removeResistor(form, controls.length - 1);
  }
}
