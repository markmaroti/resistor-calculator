import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Color } from '@resistor/resistor.model';
import { ResistorViewModel } from '@resistor/state/resistor.mappers';
import { SelectComponent } from '@shared/select/select.component';
import { ResistorPreviewComponent } from '@resistor/components/resistor-preview/resistor-preview.component';

@Component({
  selector: 'app-forward-form',
  templateUrl: './forward-form.component.html',
  styleUrl: './forward-form.component.scss',
  imports: [ReactiveFormsModule, SelectComponent, ResistorPreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForwardFormComponent {
  public readonly form = input.required<FormGroup>();
  public readonly viewModel = input.required<ResistorViewModel>();
  public readonly digitColors = input.required<readonly Color[]>();
  public readonly multiplierColors = input.required<readonly Color[]>();
  public readonly toleranceColors = input.required<readonly Color[]>();
  public readonly tcrColors = input.required<readonly Color[]>();
  public readonly bandCounts = input.required<readonly number[]>();
  public readonly applyFeedback = input<string>('');
}
