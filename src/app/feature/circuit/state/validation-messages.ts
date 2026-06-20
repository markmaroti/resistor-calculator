import { CircuitErrorCode, CircuitValidationError } from '@circuit/circuit.model';
import { ResistanceValueErrorCode } from '@shared/utils/resistance-value.util';

export const CIRCUIT_VALIDATION_MESSAGES: Record<CircuitValidationError, string> = {
  [CircuitValidationError.EmptyInput]: 'Resistance value is required.',
  [CircuitValidationError.InvalidFormat]: 'Enter a valid number.',
  [CircuitValidationError.NonPositiveValue]: 'Value must be greater than 0.',
  [CircuitValidationError.NonFiniteValue]: 'Value must be finite.',
};

export const RESISTANCE_VALUE_VALIDATION_MESSAGES: Record<ResistanceValueErrorCode, string> = {
  [ResistanceValueErrorCode.EmptyInput]: 'Resistance value is required.',
  [ResistanceValueErrorCode.InvalidFormat]:
    'Invalid resistance format. Use examples like 4.7k, 4700, 1M.',
  [ResistanceValueErrorCode.InvalidNumber]: 'Resistance number is invalid.',
  [ResistanceValueErrorCode.UnsupportedUnit]: 'Unsupported unit. Use Ω, kΩ, MΩ, or GΩ.',
  [ResistanceValueErrorCode.NonPositiveValue]: 'Resistance value must be greater than 0.',
  [ResistanceValueErrorCode.NonFiniteValue]: 'Resistance value must be finite.',
};

export function getCircuitResistorValidationMessage(code: ResistanceValueErrorCode): string {
  return RESISTANCE_VALUE_VALIDATION_MESSAGES[code];
}

export const CIRCUIT_SERVICE_MESSAGES: Record<CircuitErrorCode, string> = {
  [CircuitErrorCode.EmptyInput]: 'At least one resistor is required.',
  [CircuitErrorCode.InvalidResistor]: 'All resistor values must be valid numbers greater than 0.',
  [CircuitErrorCode.DivisionByZero]: 'Calculation resulted in division by zero.',
};

export function getCircuitValidationMessage(
  code: CircuitValidationError | CircuitErrorCode,
): string {
  if (code in CIRCUIT_VALIDATION_MESSAGES) {
    return CIRCUIT_VALIDATION_MESSAGES[code as CircuitValidationError];
  }
  return CIRCUIT_SERVICE_MESSAGES[code as CircuitErrorCode];
}
