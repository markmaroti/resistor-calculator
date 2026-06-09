import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CircuitValidationError } from '../circuit.model';

export function validateCircuitResistorValue(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value || value.trim() === '') {
    return null;
  }

  const parsed = parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return { circuitResistor: CircuitValidationError.InvalidFormat };
  }
  if (parsed <= 0) {
    return { circuitResistor: CircuitValidationError.NonPositiveValue };
  }

  return null;
}

export const circuitResistorValidator: ValidatorFn = (control) =>
  validateCircuitResistorValue(control);
