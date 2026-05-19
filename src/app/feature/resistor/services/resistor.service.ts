import { Injectable } from '@angular/core';
import {
  DIGIT_BY_COLOR,
  MULTIPLIER_BY_COLOR,
  ResistanceCalculationResult,
  ResistanceErrorCode,
  ResistanceResult,
  ResistorBandsInput,
  TCR_BY_COLOR,
  TOLERANCE_BY_COLOR,
  type BandCount,
} from '../resistor.model';

@Injectable({ providedIn: 'root' })
export class ResistorService {
  public calculateResistance(input: ResistorBandsInput): ResistanceCalculationResult {
    const digit1 = DIGIT_BY_COLOR[input.digit1];
    const digit2 = DIGIT_BY_COLOR[input.digit2];
    const digit3 = DIGIT_BY_COLOR[input.digit3];

    if (digit1 === null || digit2 === null) {
      return {
        data: this.emptyResistanceResult(),
        error: {
          code: ResistanceErrorCode.InvalidDigitColor,
          message: 'Digit bands must be a valid color (not Gold/Silver).',
        },
      };
    }

    if (input.bandCount !== 4 && digit3 === null) {
      return {
        data: this.emptyResistanceResult(),
        error: {
          code: ResistanceErrorCode.InvalidThirdDigitColor,
          message: 'Band 3 must be a valid digit color for 5- and 6-band resistors.',
        },
      };
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

    return {
      data: { ohms, tolerancePct, tcrPpm },
      error: null,
    };
  }

  public calculateResistanceFromBands(input: ResistorBandsInput): ResistanceResult {
    return this.calculateResistance(input).data;
  }

  private emptyResistanceResult(): ResistanceResult {
    return { ohms: 0, tolerancePct: null, tcrPpm: null };
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
