import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CircuitStore } from '@circuit/state/circuit.store';

import { ResistorListPanelComponent } from './components/resistor-list-panel/resistor-list-panel.component';
import { DividerPanelComponent } from './components/divider-panel/divider-panel.component';
import { CircuitTab, ResistorListTab } from './circuit.model';

const CIRCUIT_TAB_LABEL: Record<CircuitTab, string> = {
  [CircuitTab.Series]: 'Series',
  [CircuitTab.Parallel]: 'Parallel',
  [CircuitTab.Divider]: 'Divider',
};

const TABS: { key: CircuitTab; label: string }[] = Object.values(CircuitTab).map((key) => ({
  key,
  label: CIRCUIT_TAB_LABEL[key],
}));

@Component({
  selector: 'app-circuit-tools',
  templateUrl: './circuit-tools.component.html',
  styleUrl: './circuit-tools.component.scss',
  imports: [RouterLink, ResistorListPanelComponent, DividerPanelComponent],
  providers: [CircuitStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CircuitToolsComponent {
  protected readonly CircuitTab = CircuitTab;

  public readonly tabs = TABS;
  public readonly store = inject(CircuitStore);

  public removeLastResistor(form: ResistorListTab): void {
    this.store.removeResistor(form, this.store.resistorCount(form) - 1);
  }
}
