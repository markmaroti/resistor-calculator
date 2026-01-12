import { Component } from '@angular/core';
import { ResistorStore } from './resistor.store';
import {
  BAND_COUNTS,
  BandCount,
  Color,
  DIGIT_BY_COLOR,
  MULTIPLIER_BY_COLOR,
  TCR_BY_COLOR,
  TOLERANCE_BY_COLOR,
} from './resistor.model';
import { SelectComponent } from '../../shared/select/select.component';

@Component({
  selector: 'app-resistor',
  templateUrl: './resistor.component.html',
  styleUrl: './resistor.component.scss',
  imports: [SelectComponent],
  providers: [ResistorStore],
})
export class ResistorComponent {
  public readonly digitColors = (Object.keys(DIGIT_BY_COLOR) as Color[]).filter(
    (c) => DIGIT_BY_COLOR[c] !== null
  );
  public readonly multiplierColors = Object.keys(MULTIPLIER_BY_COLOR) as Color[];
  public readonly toleranceColors = Object.keys(TOLERANCE_BY_COLOR) as Color[];
  public readonly tcrColors = Object.keys(TCR_BY_COLOR) as Color[];
  public readonly bandCounts = BAND_COUNTS;

  constructor(public readonly store: ResistorStore) {}

  public onColorChange(setter: (v: Color) => void, value: string) {
    setter(value as Color);
  }

  public onBandCountChange(value: BandCount | string) {
    this.store.bandCount.set(Number(value) as BandCount);
  }
}
