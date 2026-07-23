import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

import { SelectComponent } from '@shared/select/select.component';

import { Color, ResistorBandsInput } from '@resistor/resistor.model';
import { ResistorViewModel } from '@resistor/state/resistor.mappers';
import { ResistorPreviewComponent } from '@resistor/components/resistor-preview/resistor-preview.component';

@Component({
  selector: 'app-forward-form',
  templateUrl: './forward-form.component.html',
  styleUrl: './forward-form.component.scss',
  imports: [FormField, SelectComponent, ResistorPreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForwardFormComponent {
  public readonly form = input.required<FieldTree<ResistorBandsInput>>();
  public readonly viewModel = input.required<ResistorViewModel>();
  public readonly digitColors = input.required<readonly Color[]>();
  public readonly multiplierColors = input.required<readonly Color[]>();
  public readonly toleranceColors = input.required<readonly Color[]>();
  public readonly tcrColors = input.required<readonly Color[]>();
  public readonly bandCounts = input.required<readonly number[]>();
  public readonly applyFeedback = input<string>('');
}
