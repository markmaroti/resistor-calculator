import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CircuitStore } from '@circuit/state/circuit.store';

import { ResistorListPanelComponent } from './components/resistor-list-panel/resistor-list-panel.component';
import { DividerPanelComponent } from './components/divider-panel/divider-panel.component';
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
  imports: [RouterLink, ResistorListPanelComponent, DividerPanelComponent],
  providers: [CircuitStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircuitToolsComponent {
  public readonly tabs = TABS;
  public readonly store = inject(CircuitStore);

  public removeLastResistor(form: 'series' | 'parallel'): void {
    const resistors =
      form === 'series' ? this.store.seriesForm.resistors : this.store.parallelForm.resistors;
    this.store.removeResistor(form, resistors.length - 1);
  }
}
