import { Injectable } from '@angular/core';
import {
  BAND_COUNTS,
  Color,
  DIGIT_BY_COLOR,
  MULTIPLIER_BY_COLOR,
  ReverseErrorCode,
  ReverseInput,
  ReverseMode,
  ReverseResult,
  ResistanceCalculationResult,
  ResistanceErrorCode,
  ResistanceResult,
  ResistorBandsInput,
  TCR_BY_COLOR,
  TOLERANCE_BY_COLOR,
  type BandCount,
} from '../resistor.model';
import { getResistanceValidationMessage } from '../state/validation-messages';

@Injectable({ providedIn: 'root' })
export class ResistorService {
  private static readonly MAX_REVERSE_CANDIDATES = 50;

  public calculateResistance(input: ResistorBandsInput): ResistanceCalculationResult {
    const digit1 = DIGIT_BY_COLOR[input.digit1];
    const digit2 = DIGIT_BY_COLOR[input.digit2];
    const digit3 = DIGIT_BY_COLOR[input.digit3];

    if (digit1 === null || digit2 === null) {
      return {
        data: this.emptyResistanceResult(),
        error: {
          code: ResistanceErrorCode.InvalidDigitColor,
          message: getResistanceValidationMessage(ResistanceErrorCode.InvalidDigitColor),
        },
      };
    }

    if (input.bandCount !== 4 && digit3 === null) {
      return {
        data: this.emptyResistanceResult(),
        error: {
          code: ResistanceErrorCode.InvalidThirdDigitColor,
          message: getResistanceValidationMessage(ResistanceErrorCode.InvalidThirdDigitColor),
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

  public calculateBandsFromResistance(input: ReverseInput): ReverseResult {
    if (!Number.isFinite(input.targetOhms) || input.targetOhms <= 0) {
      return {
        data: { candidates: [] },
        error: {
          code: ReverseErrorCode.InvalidTargetOhms,
          message: 'Target resistance must be a finite number greater than 0.',
        },
      };
    }

    if (!BAND_COUNTS.includes(input.bandCount)) {
      return {
        data: { candidates: [] },
        error: {
          code: ReverseErrorCode.UnsupportedBandCount,
          message: 'Only 4, 5, and 6 band reverse calculation is supported.',
        },
      };
    }

    const toleranceColors = this.getToleranceColors(input.tolerancePct);
    if (toleranceColors.length === 0) {
      return {
        data: { candidates: [] },
        error: {
          code: ReverseErrorCode.NoCandidates,
          message: 'No matching resistor bands found for the selected input.',
        },
      };
    }

    const tcrColors = this.getTcrColors(input.bandCount, input.tcrPpm);
    if (tcrColors.length === 0) {
      return {
        data: { candidates: [] },
        error: {
          code: ReverseErrorCode.NoCandidates,
          message: 'No matching resistor bands found for the selected input.',
        },
      };
    }

    const digitCount = input.bandCount === 4 ? 2 : 3;
    const minSignificant = digitCount === 2 ? 10 : 100;
    const maxSignificant = digitCount === 2 ? 99 : 999;
    const candidates: ReverseResult['data']['candidates'] = [];

    for (const [multiplierColor, multiplier] of Object.entries(MULTIPLIER_BY_COLOR) as [
      Color,
      number,
    ][]) {
      const significantValue = input.targetOhms / multiplier;
      const possibleSignificants =
        input.mode === ReverseMode.Exact
          ? [significantValue]
          : [
              Math.floor(significantValue),
              Math.round(significantValue),
              Math.ceil(significantValue),
            ];

      for (const significant of new Set(possibleSignificants)) {
        if (!Number.isFinite(significant)) {
          continue;
        }

        if (!Number.isInteger(significant)) {
          continue;
        }

        if (significant < minSignificant || significant > maxSignificant) {
          continue;
        }

        const digits = this.toDigits(significant, digitCount);
        if (!digits) {
          continue;
        }

        const bandInputBase: ResistorBandsInput = {
          bandCount: input.bandCount,
          digit1: this.colorForDigit(digits[0]),
          digit2: this.colorForDigit(digits[1]),
          digit3: digitCount === 3 ? this.colorForDigit(digits[2]) : Color.Black,
          multiplier: multiplierColor,
          tolerance: Color.Gold,
          tcr: Color.Brown,
        };

        for (const toleranceColor of toleranceColors) {
          for (const tcrColor of tcrColors) {
            const bands: ResistorBandsInput = {
              ...bandInputBase,
              tolerance: toleranceColor,
              tcr: tcrColor,
            };
            const resistance = this.calculateResistanceFromBands(bands);
            const deltaOhms = Math.abs(resistance.ohms - input.targetOhms);
            const deltaPct = (deltaOhms / input.targetOhms) * 100;

            if (input.mode === ReverseMode.Exact && deltaOhms !== 0) {
              continue;
            }

            candidates.push({
              bands,
              ohms: resistance.ohms,
              tolerancePct: resistance.tolerancePct,
              tcrPpm: resistance.tcrPpm,
              deltaOhms,
              deltaPct,
            });
          }
        }
      }
    }

    const sortedCandidates = candidates
      .sort((a, b) => {
        if (a.deltaOhms !== b.deltaOhms) {
          return a.deltaOhms - b.deltaOhms;
        }
        if (a.deltaPct !== b.deltaPct) {
          return a.deltaPct - b.deltaPct;
        }

        const bandKeyA = `${a.bands.digit1}-${a.bands.digit2}-${a.bands.digit3}-${a.bands.multiplier}-${a.bands.tolerance}-${a.bands.tcr}`;
        const bandKeyB = `${b.bands.digit1}-${b.bands.digit2}-${b.bands.digit3}-${b.bands.multiplier}-${b.bands.tolerance}-${b.bands.tcr}`;
        return bandKeyA.localeCompare(bandKeyB);
      })
      .slice(0, ResistorService.MAX_REVERSE_CANDIDATES);

    if (sortedCandidates.length === 0) {
      return {
        data: { candidates: [] },
        error: {
          code: ReverseErrorCode.NoCandidates,
          message: 'No matching resistor bands found for the selected input.',
        },
      };
    }

    return {
      data: { candidates: sortedCandidates },
      error: null,
    };
  }

  private emptyResistanceResult(): ResistanceResult {
    return { ohms: 0, tolerancePct: null, tcrPpm: null };
  }

  private colorForDigit(digit: number): Color {
    const color = (Object.keys(DIGIT_BY_COLOR) as Color[]).find(
      (key) => DIGIT_BY_COLOR[key] === digit,
    );
    if (!color) {
      throw new Error(`Missing color mapping for digit ${digit}`);
    }
    return color;
  }

  private toDigits(significant: number, digitCount: 2 | 3): number[] | null {
    const text = significant.toString();
    if (text.length !== digitCount) {
      return null;
    }

    const digits = text.split('').map((ch) => Number(ch));
    if (digits.some((d) => Number.isNaN(d))) {
      return null;
    }

    return digits;
  }

  private getToleranceColors(tolerancePct: number | null): Color[] {
    const allToleranceColors = Object.keys(TOLERANCE_BY_COLOR) as Color[];
    if (tolerancePct === null) {
      return allToleranceColors;
    }

    return allToleranceColors.filter((color) => TOLERANCE_BY_COLOR[color] === tolerancePct);
  }

  private getTcrColors(bandCount: BandCount, tcrPpm: number | null): Color[] {
    if (bandCount !== 6) {
      return [Color.Brown];
    }

    const allTcrColors = Object.keys(TCR_BY_COLOR) as Color[];
    if (tcrPpm === null) {
      return allTcrColors;
    }

    return allTcrColors.filter((color) => TCR_BY_COLOR[color] === tcrPpm);
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
