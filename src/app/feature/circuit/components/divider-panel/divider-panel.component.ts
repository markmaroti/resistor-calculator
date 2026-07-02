import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { AmpsPipe } from '@shared/pipes/amps.pipe';
import { VoltsPipe } from '@shared/pipes/volts.pipe';

@Component({
  selector: 'app-divider-panel',
  templateUrl: './divider-panel.component.html',
  styleUrl: './divider-panel.component.scss',
  imports: [ReactiveFormsModule, VoltsPipe, AmpsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DividerPanelComponent {
  public readonly form = input.required<
    FormGroup<{
      vin: FormControl<string>;
      r1: FormControl<string>;
      r2: FormControl<string>;
    }>
  >();
  public readonly vout = input.required<number | null>();
  public readonly current = input.required<number | null>();
  public readonly validationMessage = input.required<string>();

  public readonly resetForm = output<void>();
}
