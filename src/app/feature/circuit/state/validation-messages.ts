import { CircuitErrorCode, CircuitValidationError } from '../circuit.model';

export const CIRCUIT_VALIDATION_MESSAGES: Record<CircuitValidationError, string> = {
  [CircuitValidationError.EmptyInput]: 'Resistor value is required.',
  [CircuitValidationError.InvalidFormat]: 'Enter a valid number.',
  [CircuitValidationError.NonPositiveValue]: 'Value must be greater than 0.',
  [CircuitValidationError.NonFiniteValue]: 'Value must be finite.',
};

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
