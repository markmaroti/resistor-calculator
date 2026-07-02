import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { OhmsPipe } from '@shared/pipes/ohms.pipe';

@Component({
  selector: 'app-resistor-list-panel',
  templateUrl: './resistor-list-panel.component.html',
  styleUrl: './resistor-list-panel.component.scss',
  imports: [ReactiveFormsModule, OhmsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResistorListPanelComponent {
  public readonly form = input.required<FormGroup<{ resistors: FormArray<FormControl<string>> }>>();
  public readonly totalOhms = input.required<number | null>();
  public readonly validationMessage = input.required<string>();

  public readonly addResistor = output<void>();
  public readonly removeLastResistor = output<void>();
  public readonly resetForm = output<void>();
}
