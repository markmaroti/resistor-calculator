import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  BAND_COUNTS,
  Color,
  DIGIT_BY_COLOR,
  MULTIPLIER_BY_COLOR,
  TCR_BY_COLOR,
  TOLERANCE_BY_COLOR,
} from './resistor.model';
import { ResistorStore } from './state/resistor.store';
import { RouterLink } from '@angular/router';
import { SelectComponent } from '../../shared/select/select.component';
import { ResistorPreviewComponent } from './components/resistor-preview.component';
import { ReferencePanelComponent } from './components/reference-panel.component';
import { OhmsPipe } from './pipes/ohms-pipe';

@Component({
  selector: 'app-resistor',
  templateUrl: './resistor.component.html',
  styleUrl: './resistor.component.scss',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    SelectComponent,
    ResistorPreviewComponent,
    ReferencePanelComponent,
    OhmsPipe,
  ],
  providers: [ResistorStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResistorComponent {
  private readonly store = inject(ResistorStore);
  public readonly form = this.store.form;
  public readonly viewModel = this.store.viewModel;
  public readonly validationMessage = this.store.validationMessage;
  public readonly showHelp = signal(false);
  public readonly digitColors = (Object.keys(DIGIT_BY_COLOR) as Color[]).filter(
    (c) => DIGIT_BY_COLOR[c] !== null,
  );
  public readonly multiplierColors = Object.keys(MULTIPLIER_BY_COLOR) as Color[];
  public readonly toleranceColors = Object.keys(TOLERANCE_BY_COLOR) as Color[];
  public readonly tcrColors = Object.keys(TCR_BY_COLOR) as Color[];
  public readonly bandCounts = BAND_COUNTS;

  public toggleHelp() {
    this.showHelp.update((value) => !value);
  }
}
