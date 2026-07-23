import { describe, expect, it } from 'vitest';

import { ResistanceValueErrorCode } from '@shared/utils/resistance-value.util';

import { CircuitValidationError } from '@circuit/circuit.model';

import { validateCircuitNumberValue, validateCircuitResistorValue } from './circuit.validators';

describe('validateCircuitResistorValue', () => {
  it('returns null for valid SI resistor input', () => {
    expect(validateCircuitResistorValue('4.7k')).toBeNull();
  });

  it('returns null for blank input because required handles empties', () => {
    expect(validateCircuitResistorValue('   ')).toBeNull();
  });

  it('returns parser error code for unsupported unit', () => {
    expect(validateCircuitResistorValue('10x')).toEqual({
      kind: 'circuitResistor',
      code: ResistanceValueErrorCode.UnsupportedUnit,
    });
  });

  it('returns parser error code for non-positive value', () => {
    expect(validateCircuitResistorValue('0')).toEqual({
      kind: 'circuitResistor',
      code: ResistanceValueErrorCode.NonPositiveValue,
    });
  });
});

describe('validateCircuitNumberValue', () => {
  it('returns null for valid numeric input', () => {
    expect(validateCircuitNumberValue('12.5')).toBeNull();
  });

  it('keeps parseFloat behavior for SI-like vin input', () => {
    expect(validateCircuitNumberValue('4.7k')).toBeNull();
  });

  it('returns INVALID_FORMAT for non-numeric input', () => {
    expect(validateCircuitNumberValue('abc')).toEqual({
      kind: 'circuitNumber',
      code: CircuitValidationError.InvalidFormat,
    });
  });

  it('returns NON_FINITE_VALUE for infinity input', () => {
    expect(validateCircuitNumberValue('Infinity')).toEqual({
      kind: 'circuitNumber',
      code: CircuitValidationError.NonFiniteValue,
    });
  });

  it('returns NON_POSITIVE_VALUE for zero input', () => {
    expect(validateCircuitNumberValue('0')).toEqual({
      kind: 'circuitNumber',
      code: CircuitValidationError.NonPositiveValue,
    });
  });
});
