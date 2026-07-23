import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

import { AmpsPipe } from '@shared/pipes/amps.pipe';
import { VoltsPipe } from '@shared/pipes/volts.pipe';

import { DividerFormValue } from '@circuit/circuit.model';

@Component({
  selector: 'app-divider-panel',
  templateUrl: './divider-panel.component.html',
  styleUrl: './divider-panel.component.scss',
  imports: [FormField, VoltsPipe, AmpsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerPanelComponent {
  public readonly form = input.required<FieldTree<DividerFormValue>>();
  public readonly vout = input.required<number | null>();
  public readonly current = input.required<number | null>();
  public readonly validationMessage = input.required<string>();

  public readonly resetForm = output<void>();
}
