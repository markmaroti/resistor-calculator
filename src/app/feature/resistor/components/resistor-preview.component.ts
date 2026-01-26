import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { BAND_LAYOUTS, BandCount, buildBandColors, Color, COLOR_HEX } from '../resistor.model';

@Component({
  selector: 'app-resistor-preview',
  templateUrl: './resistor-preview.component.html',
  styleUrl: './resistor-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResistorPreviewComponent {
  public readonly bandCount = input.required<BandCount>();
  public readonly digit1 = input.required<Color>();
  public readonly digit2 = input.required<Color>();
  public readonly digit3 = input.required<Color>();
  public readonly multiplier = input.required<Color>();
  public readonly tolerance = input.required<Color>();
  public readonly tcr = input.required<Color>();

  public readonly colorHex = COLOR_HEX;

  public readonly bands = computed(() => {
    const count = this.bandCount();
    const layout = BAND_LAYOUTS[count];
    const colors = buildBandColors(count, {
      digit1: this.digit1(),
      digit2: this.digit2(),
      digit3: this.digit3(),
      multiplier: this.multiplier(),
      tolerance: this.tolerance(),
      tcr: this.tcr(),
    });

    return layout.xs.map((x, i) => ({
      x,
      width: layout.width,
      color: colors[i],
    }));
  });
}
