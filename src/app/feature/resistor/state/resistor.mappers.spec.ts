import { describe, expect, it } from 'vitest';
import {
  Color,
  ResistanceCalculationResult,
  ResistanceErrorCode,
  ResistorBandsInput,
} from '../resistor.model';
import { toResistorInput, toViewModel } from './resistor.mappers';

const input: ResistorBandsInput = {
  bandCount: 6,
  digit1: Color.Orange,
  digit2: Color.Orange,
  digit3: Color.Black,
  multiplier: Color.Brown,
  tolerance: Color.Brown,
  tcr: Color.Violet,
};

describe('resistor mappers', () => {
  it('toResistorInput returns a stable domain-shaped object', () => {
    expect(toResistorInput(input)).toEqual(input);
  });

  it('toViewModel maps calculated result into UI view model', () => {
    const result: ResistanceCalculationResult = {
      data: {
        ohms: 3_300,
        tolerancePct: 1,
        tcrPpm: 5,
      },
      error: null,
    };

    const vm = toViewModel(input, result);

    expect(vm.ohms).toBe(3_300);
    expect(vm.tolerancePct).toBe(1);
    expect(vm.tcrPpm).toBe(5);
    expect(vm.showDigit3).toBe(true);
    expect(vm.showTcr).toBe(true);
    expect(vm.calculationError).toBeNull();
  });

  it('toViewModel carries calculation error through', () => {
    const result: ResistanceCalculationResult = {
      data: {
        ohms: 0,
        tolerancePct: null,
        tcrPpm: null,
      },
      error: {
        code: ResistanceErrorCode.InvalidDigitColor,
        message: 'Digit bands must be a valid color (not Gold/Silver).',
      },
    };

    const vm = toViewModel(input, result);

    expect(vm.calculationError).toEqual(result.error);
  });
});
