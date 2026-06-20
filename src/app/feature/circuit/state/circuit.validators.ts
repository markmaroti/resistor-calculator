import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { CircuitValidationError } from '@circuit/circuit.model';
import { parseResistanceValue } from '@shared/utils/resistance-value.util';

export function validateCircuitResistorValue(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value || value.trim() === '') {
    return null;
  }

  const parsed = parseResistanceValue(value);
  if (parsed.error) {
    return { circuitResistor: parsed.error.code };
  }

  return null;
}

export function validateCircuitNumberValue(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value || value.trim() === '') {
    return null;
  }

  const parsed = parseFloat(value);
  if (Number.isNaN(parsed)) {
    return { circuitNumber: CircuitValidationError.InvalidFormat };
  }
  if (!Number.isFinite(parsed)) {
    return { circuitNumber: CircuitValidationError.NonFiniteValue };
  }
  if (parsed <= 0) {
    return { circuitNumber: CircuitValidationError.NonPositiveValue };
  }

  return null;
}

export const circuitResistorValidator: ValidatorFn = (control) =>
  validateCircuitResistorValue(control);

export const circuitNumberValidator: ValidatorFn = (control) => validateCircuitNumberValue(control);
