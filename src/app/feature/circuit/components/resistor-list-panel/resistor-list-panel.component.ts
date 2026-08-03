import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

import { OhmsPipe } from '@shared/pipes/ohms.pipe';

import { ResistorListFormValue } from '@circuit/circuit.model';

@Component({
  selector: 'app-resistor-list-panel',
  templateUrl: './resistor-list-panel.component.html',
  styleUrl: './resistor-list-panel.component.scss',
  imports: [FormField, OhmsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResistorListPanelComponent {
  public readonly form = input.required<FieldTree<ResistorListFormValue>>();
  public readonly totalOhms = input.required<number | null>();
  public readonly validationMessage = input.required<string>();

  public readonly addResistor = output<void>();
  public readonly removeLastResistor = output<void>();
  public readonly resetForm = output<void>();
}
