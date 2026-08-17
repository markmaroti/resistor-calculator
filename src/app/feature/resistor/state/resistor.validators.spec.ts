import { describe, expect, it } from 'vitest';

import { ResistanceValueErrorCode } from '@shared/utils/resistance-value.util';

import { Color, ResistanceErrorCode } from '@resistor/resistor.model';

import {
  validateDigitColor,
  validateReverseTargetInput,
  validateThirdDigitColor,
} from './resistor.validators';

describe('validateDigitColor', () => {
  it('returns null for a valid digit color', () => {
    expect(validateDigitColor(Color.Brown)).toBeNull();
  });

  it('rejects Gold, which only has meaning as a multiplier/tolerance band', () => {
    expect(validateDigitColor(Color.Gold)).toEqual({
      kind: 'digitColor',
      code: ResistanceErrorCode.InvalidDigitColor,
    });
  });

  it('rejects Silver, which only has meaning as a multiplier/tolerance band', () => {
    expect(validateDigitColor(Color.Silver)).toEqual({
      kind: 'digitColor',
      code: ResistanceErrorCode.InvalidDigitColor,
    });
  });
});

describe('validateThirdDigitColor', () => {
  it('ignores Gold/Silver for 4-band resistors, where band 3 does not exist', () => {
    expect(validateThirdDigitColor(Color.Gold, 4)).toBeNull();
    expect(validateThirdDigitColor(Color.Silver, 4)).toBeNull();
  });

  it('accepts a valid digit color for 5- and 6-band resistors', () => {
    expect(validateThirdDigitColor(Color.Red, 5)).toBeNull();
    expect(validateThirdDigitColor(Color.Red, 6)).toBeNull();
  });

  it('rejects Gold/Silver for 5- and 6-band resistors', () => {
    expect(validateThirdDigitColor(Color.Gold, 5)).toEqual({
      kind: 'digitColor',
      code: ResistanceErrorCode.InvalidThirdDigitColor,
    });
    expect(validateThirdDigitColor(Color.Silver, 6)).toEqual({
      kind: 'digitColor',
      code: ResistanceErrorCode.InvalidThirdDigitColor,
    });
  });
});

describe('validateReverseTargetInput', () => {
  it('returns null for blank input because required() handles empties', () => {
    expect(validateReverseTargetInput('   ')).toBeNull();
  });

  it('returns null for valid SI resistance input', () => {
    expect(validateReverseTargetInput('4.7k')).toBeNull();
  });

  it('returns parser error code for invalid format', () => {
    expect(validateReverseTargetInput('abc')).toEqual({
      kind: 'reverseTargetInput',
      code: ResistanceValueErrorCode.InvalidFormat,
    });
  });

  it('returns parser error code for an unsupported unit (e.g. Volt, not Ohm)', () => {
    expect(validateReverseTargetInput('5V')).toEqual({
      kind: 'reverseTargetInput',
      code: ResistanceValueErrorCode.UnsupportedUnit,
    });
  });

  it('returns parser error code for non-positive value', () => {
    expect(validateReverseTargetInput('0')).toEqual({
      kind: 'reverseTargetInput',
      code: ResistanceValueErrorCode.NonPositiveValue,
    });
  });
});
