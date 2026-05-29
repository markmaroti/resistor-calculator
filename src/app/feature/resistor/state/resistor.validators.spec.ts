import { FormControl, FormGroup } from '@angular/forms';
import { describe, expect, it } from 'vitest';
import { BandCount, Color, ResistorBandsInput } from '../resistor.model';
import { validateResistorBands, validateReverseValue } from './resistor.validators';

function buildValue(overrides: Partial<ResistorBandsInput> = {}): ResistorBandsInput {
  return {
    bandCount: 4 as BandCount,
    digit1: Color.Brown,
    digit2: Color.Black,
    digit3: Color.Black,
    multiplier: Color.Black,
    tolerance: Color.Gold,
    tcr: Color.Brown,
    ...overrides,
  };
}

describe('validateResistorBands', () => {
  it('returns null for valid 4-band values', () => {
    const control = new FormControl(buildValue());

    expect(validateResistorBands(control)).toBeNull();
  });

  it('returns invalidDigits when digit1 or digit2 is not a valid digit color', () => {
    const control = new FormControl(buildValue({ digit1: Color.Gold }));

    expect(validateResistorBands(control)).toEqual({ invalidDigits: true });
  });

  it('returns invalidDigit3 when 5-band value has non-digit third band', () => {
    const control = new FormControl(buildValue({ bandCount: 5, digit3: Color.Silver }));

    expect(validateResistorBands(control)).toEqual({ invalidDigit3: true });
  });

  it('returns null for nullish value', () => {
    const control = new FormGroup({});

    expect(validateResistorBands(control)).toBeNull();
  });
});

describe('validateReverseValue', () => {
  it('returns null for parseable reverse target input', () => {
    const control = new FormControl({ targetInput: '4.7k' });

    expect(validateReverseValue(control)).toBeNull();
  });

  it('returns reverseTarget error code for invalid reverse target input', () => {
    const control = new FormControl({ targetInput: '' });

    expect(validateReverseValue(control)).toEqual({ reverseTarget: 'EMPTY_INPUT' });
  });
});
