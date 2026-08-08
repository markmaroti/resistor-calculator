import { describe, expect, it } from 'vitest';

import { CircuitErrorCode, CircuitValidationError } from '@circuit/circuit.model';

import {
  getCircuitFieldValidationMessage,
  getCircuitServiceValidationMessage,
} from './validation-messages';

describe('getCircuitFieldValidationMessage', () => {
  it('resolves the field-level message for a blank/required field', () => {
    expect(getCircuitFieldValidationMessage(CircuitValidationError.EmptyInput)).toBe(
      'Resistance value is required.',
    );
  });

  it('resolves the message for an invalid number format', () => {
    expect(getCircuitFieldValidationMessage(CircuitValidationError.InvalidFormat)).toBe(
      'Enter a valid number.',
    );
  });

  it('resolves the message for a non-positive value', () => {
    expect(getCircuitFieldValidationMessage(CircuitValidationError.NonPositiveValue)).toBe(
      'Value must be greater than 0.',
    );
  });

  it('resolves the message for a non-finite value', () => {
    expect(getCircuitFieldValidationMessage(CircuitValidationError.NonFiniteValue)).toBe(
      'Value must be finite.',
    );
  });
});

describe('getCircuitServiceValidationMessage', () => {
  it('resolves the service-level message for an empty resistor list, not the field-level message', () => {
    expect(getCircuitServiceValidationMessage(CircuitErrorCode.EmptyInput)).toBe(
      'At least one resistor is required.',
    );
  });

  it('resolves the message for an invalid resistor value', () => {
    expect(getCircuitServiceValidationMessage(CircuitErrorCode.InvalidResistor)).toBe(
      'All resistor values must be valid numbers greater than 0.',
    );
  });

  it('resolves the message for a division-by-zero result', () => {
    expect(getCircuitServiceValidationMessage(CircuitErrorCode.DivisionByZero)).toBe(
      'Calculation resulted in division by zero.',
    );
  });
});
