import { Component } from '@angular/core';
import { ResistorStore } from './resistor.store';
import {
  Color,
  DIGIT_BY_COLOR,
  MULTIPLIER_BY_COLOR,
  TCR_BY_COLOR,
  TOLERANCE_BY_COLOR,
} from './resistor.model';

@Component({
  selector: 'app-resistor',
  imports: [],
  templateUrl: './resistor.component.html',
  styleUrl: './resistor.component.scss',
})
export class ResistorComponent {
  store = new ResistorStore();
  digitColors = (Object.keys(DIGIT_BY_COLOR) as Color[]).filter((c) => DIGIT_BY_COLOR[c] !== null);
  multiplierColors = Object.keys(MULTIPLIER_BY_COLOR) as Color[];
  toleranceColors = Object.keys(TOLERANCE_BY_COLOR) as Color[];
  tcrColors = Object.keys(TCR_BY_COLOR) as Color[];

  public onColorChange(setter: (v: Color) => void, value: string) {
    setter(value as Color);
  }

  public onBandCountChange(value: string) {
    this.store.bandCount.set(+value as 4 | 5 | 6);
  }
}
