import { describe, expect, it } from 'vitest';

import { parseResistanceValue } from '@shared/utils/resistance-value.util';

import {
  Color,
  ReverseErrorCode,
  ReverseFormValue,
  ReverseMode,
  ReverseResult,
  ResistanceCalculationResult,
  ResistanceErrorCode,
  ResistorBandsInput,
} from '@resistor/resistor.model';

import { toReverseInput, toReverseViewModel, toViewModel } from './resistor.mappers';

const input: ResistorBandsInput = {
  bandCount: 6,
  digit1: Color.Orange,
  digit2: Color.Orange,
  digit3: Color.Black,
  multiplier: Color.Brown,
  tolerance: Color.Brown,
  tcr: Color.Violet,
};

const reverseFormValue: ReverseFormValue = {
  targetInput: '4.7k',
  bandCount: 4,
  tolerancePct: null,
  tcrPpm: null,
  mode: ReverseMode.Exact,
};

describe('resistor mappers', () => {
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

  it('toReverseInput maps reverse form value to service input', () => {
    const mapped = toReverseInput(reverseFormValue, 4_700);

    expect(mapped).toEqual({
      bandCount: 4,
      targetOhms: 4_700,
      tolerancePct: null,
      tcrPpm: null,
      mode: ReverseMode.Exact,
    });
  });

  it('toReverseViewModel maps parse and service success into reverse vm', () => {
    const parsed = parseResistanceValue(reverseFormValue.targetInput);
    const serviceResult: ReverseResult = {
      data: { candidates: [] },
      error: null,
    };

    const vm = toReverseViewModel(reverseFormValue, parsed, serviceResult);

    expect(vm.targetInput).toBe('4.7k');
    expect(vm.targetOhms).toBe(4_700);
    expect(vm.isValidTarget).toBe(true);
    expect(vm.parseErrorCode).toBeNull();
    expect(vm.serviceErrorCode).toBeNull();
    expect(vm.showTcr).toBe(false);
  });

  it('toReverseViewModel keeps service error code', () => {
    const parsed = parseResistanceValue(reverseFormValue.targetInput);
    const serviceResult: ReverseResult = {
      data: { candidates: [] },
      error: {
        code: ReverseErrorCode.NoCandidates,
        message: 'No matching resistor bands found for the selected input.',
      },
    };

    const vm = toReverseViewModel(reverseFormValue, parsed, serviceResult);

    expect(vm.serviceErrorCode).toBe(ReverseErrorCode.NoCandidates);
  });
});
