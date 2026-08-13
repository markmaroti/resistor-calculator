import { schema, required, validate } from '@angular/forms/signals';

import {
  ResistanceValueErrorCode,
  parseResistanceValue,
} from '@shared/utils/resistance-value.util';

import { CircuitValidationError } from '@circuit/circuit.model';

import { parseCircuitNumber } from './circuit.mappers';
import {
  getCircuitFieldValidationMessage,
  getCircuitResistorValidationMessage,
} from './validation-messages';

export type CircuitResistorValidationError = {
  kind: 'circuitResistor';
  code: ResistanceValueErrorCode;
};

export function validateCircuitResistorValue(value: string): CircuitResistorValidationError | null {
  if (isBlank(value)) {
    return null;
  }

  const parsed = parseResistanceValue(value);
  if (parsed.error) {
    return { kind: 'circuitResistor', code: parsed.error.code };
  }

  return null;
}

export type CircuitNumberValidationError = {
  kind: 'circuitNumber';
  code: CircuitValidationError;
};

export function validateCircuitNumberValue(value: string): CircuitNumberValidationError | null {
  if (isBlank(value)) {
    return null;
  }

  const parsed = parseCircuitNumber(value);
  if (Number.isNaN(parsed)) {
    return { kind: 'circuitNumber', code: CircuitValidationError.InvalidFormat };
  }
  if (!Number.isFinite(parsed)) {
    return { kind: 'circuitNumber', code: CircuitValidationError.NonFiniteValue };
  }
  if (parsed <= 0) {
    return { kind: 'circuitNumber', code: CircuitValidationError.NonPositiveValue };
  }

  return null;
}

function isBlank(value: string): boolean {
  return !value || value.trim() === '';
}

const REQUIRED_MESSAGE = getCircuitFieldValidationMessage(CircuitValidationError.EmptyInput);

export const resistorFieldSchema = schema<string>((path) => {
  required(path, { message: REQUIRED_MESSAGE });
  validate(path, ({ value }) => {
    const result = validateCircuitResistorValue(value());
    if (!result) {
      return null;
    }

    return { kind: result.kind, message: getCircuitResistorValidationMessage(result.code) };
  });
});

export const circuitNumberFieldSchema = schema<string>((path) => {
  required(path, { message: REQUIRED_MESSAGE });
  validate(path, ({ value }) => {
    const result = validateCircuitNumberValue(value());
    if (!result) {
      return null;
    }

    return { kind: result.kind, message: getCircuitFieldValidationMessage(result.code) };
  });
});
