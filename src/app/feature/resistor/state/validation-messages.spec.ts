import { describe, expect, it } from 'vitest';

import { ResistanceValueErrorCode } from '@shared/utils/resistance-value.util';

import { ReverseErrorCode, ResistanceErrorCode } from '@resistor/resistor.model';

import {
  getReverseParseValidationMessage,
  getReverseServiceValidationMessage,
  getResistanceValidationMessage,
} from './validation-messages';

describe('getResistanceValidationMessage', () => {
  it('resolves the message for an invalid digit color', () => {
    expect(getResistanceValidationMessage(ResistanceErrorCode.InvalidDigitColor)).toBe(
      'Digit bands must be a valid color (not Gold/Silver).',
    );
  });

  it('resolves the message for an invalid third digit color', () => {
    expect(getResistanceValidationMessage(ResistanceErrorCode.InvalidThirdDigitColor)).toBe(
      'Band 3 must be a valid digit color for 5- and 6-band resistors.',
    );
  });
});

describe('getReverseParseValidationMessage', () => {
  it('resolves the message for a blank/required target input', () => {
    expect(getReverseParseValidationMessage(ResistanceValueErrorCode.EmptyInput)).toBe(
      'Resistance value is required.',
    );
  });
});

describe('getReverseServiceValidationMessage', () => {
  it('resolves the message for an out-of-range target resistance', () => {
    expect(getReverseServiceValidationMessage(ReverseErrorCode.InvalidTargetOhms)).toBe(
      'Target resistance must be a finite number greater than 0.',
    );
  });

  it('resolves the message for no matching candidates', () => {
    expect(getReverseServiceValidationMessage(ReverseErrorCode.NoCandidates)).toBe(
      'No matching resistor bands found for the selected input.',
    );
  });
});
