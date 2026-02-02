import { Injectable } from '@angular/core';
import {
  DIGIT_BY_COLOR,
  MULTIPLIER_BY_COLOR,
  TCR_BY_COLOR,
  TOLERANCE_BY_COLOR,
  type BandCount,
  type Color,
} from '../resistor.model';

export type ResistorBandsInput = {
  bandCount: BandCount;
  digit1: Color;
  digit2: Color;
  digit3: Color;
  multiplier: Color;
  tolerance: Color;
  tcr: Color;
};

export type ResistanceResult = {
  ohms: number;
  tolerancePct: number | null;
  tcrPpm: number | null;
};

@Injectable({ providedIn: 'root' })
export class ResistorDomainService {
  public calculateResistanceFromBands(input: ResistorBandsInput): ResistanceResult {
    const digit1 = DIGIT_BY_COLOR[input.digit1];
    const digit2 = DIGIT_BY_COLOR[input.digit2];
    const digit3 = DIGIT_BY_COLOR[input.digit3];

    if (digit1 === null || digit2 === null) {
      return { ohms: 0, tolerancePct: null, tcrPpm: null };
    }

    const significantValue = this.calculateSignificantValue(
      input.bandCount,
      digit1,
      digit2,
      digit3,
    );

    const ohms = significantValue * MULTIPLIER_BY_COLOR[input.multiplier];
    const tolerancePct = TOLERANCE_BY_COLOR[input.tolerance] ?? null;
    const tcrPpm = input.bandCount === 6 ? (TCR_BY_COLOR[input.tcr] ?? null) : null;

    return { ohms, tolerancePct, tcrPpm };
  }

  private calculateSignificantValue(
    bandCount: BandCount,
    digit1: number,
    digit2: number,
    digit3: number | null,
  ): number {
    if (bandCount === 4) {
      return digit1 * 10 + digit2;
    }
    return digit3 === null ? 0 : digit1 * 100 + digit2 * 10 + digit3;
  }
}
