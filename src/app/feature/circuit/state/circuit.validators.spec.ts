import { FormControl } from '@angular/forms';
import { describe, expect, it } from 'vitest';

import { CircuitValidationError } from '@circuit/circuit.model';
import { ResistanceValueErrorCode } from '@shared/utils/resistance-value.util';
import { validateCircuitNumberValue, validateCircuitResistorValue } from './circuit.validators';

describe('validateCircuitResistorValue', () => {
  it('returns null for valid SI resistor input', () => {
    const control = new FormControl('4.7k');

    expect(validateCircuitResistorValue(control)).toBeNull();
  });

  it('returns null for blank input because required handles empties', () => {
    const control = new FormControl('   ');

    expect(validateCircuitResistorValue(control)).toBeNull();
  });

  it('returns parser error code for unsupported unit', () => {
    const control = new FormControl('10x');

    expect(validateCircuitResistorValue(control)).toEqual({
      circuitResistor: ResistanceValueErrorCode.UnsupportedUnit,
    });
  });

  it('returns parser error code for non-positive value', () => {
    const control = new FormControl('0');

    expect(validateCircuitResistorValue(control)).toEqual({
      circuitResistor: ResistanceValueErrorCode.NonPositiveValue,
    });
  });
});

describe('validateCircuitNumberValue', () => {
  it('returns null for valid numeric input', () => {
    const control = new FormControl('12.5');

    expect(validateCircuitNumberValue(control)).toBeNull();
  });

  it('keeps parseFloat behavior for SI-like vin input', () => {
    const control = new FormControl('4.7k');

    expect(validateCircuitNumberValue(control)).toBeNull();
  });

  it('returns INVALID_FORMAT for non-numeric input', () => {
    const control = new FormControl('abc');

    expect(validateCircuitNumberValue(control)).toEqual({
      circuitNumber: CircuitValidationError.InvalidFormat,
    });
  });

  it('returns NON_FINITE_VALUE for infinity input', () => {
    const control = new FormControl('Infinity');

    expect(validateCircuitNumberValue(control)).toEqual({
      circuitNumber: CircuitValidationError.NonFiniteValue,
    });
  });

  it('returns NON_POSITIVE_VALUE for zero input', () => {
    const control = new FormControl('0');

    expect(validateCircuitNumberValue(control)).toEqual({
      circuitNumber: CircuitValidationError.NonPositiveValue,
    });
  });
});
