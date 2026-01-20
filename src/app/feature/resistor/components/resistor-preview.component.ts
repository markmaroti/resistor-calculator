import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { BandCount, Color, COLOR_HEX } from '../resistor.model';

@Component({
  selector: 'app-resistor-preview',
  templateUrl: './resistor-preview.component.html',
  styleUrl: './resistor-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResistorPreviewComponent {
  readonly bandCount = input.required<BandCount>();
  readonly digit1 = input.required<Color>();
  readonly digit2 = input.required<Color>();
  readonly digit3 = input.required<Color>();
  readonly multiplier = input.required<Color>();
  readonly tolerance = input.required<Color>();
  readonly tcr = input.required<Color>();

  public readonly colorHex = COLOR_HEX;
}
