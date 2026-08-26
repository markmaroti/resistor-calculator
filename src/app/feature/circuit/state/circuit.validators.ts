import { schema, required, validate } from '@angular/forms/signals';

import { parseStrictNumber } from '@shared/utils/numeric-value.util';
import {
  ResistanceValueErrorCode,
  parseResistanceValue,
} from '@shared/utils/resistance-value.util';
import { isBlank, toValidationError } from '@shared/utils/signal-forms.util';

import { CircuitValidationError } from '@circuit/circuit.model';

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

  const parsed = parseStrictNumber(value);
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

const REQUIRED_MESSAGE = getCircuitFieldValidationMessage(CircuitValidationError.EmptyInput);

export const resistorFieldSchema = schema<string>((path) => {
  required(path, { message: REQUIRED_MESSAGE });
  validate(path, ({ value }) =>
    toValidationError(validateCircuitResistorValue(value()), getCircuitResistorValidationMessage),
  );
});

export const circuitNumberFieldSchema = schema<string>((path) => {
  required(path, { message: REQUIRED_MESSAGE });
  validate(path, ({ value }) =>
    toValidationError(validateCircuitNumberValue(value()), getCircuitFieldValidationMessage),
  );
});
