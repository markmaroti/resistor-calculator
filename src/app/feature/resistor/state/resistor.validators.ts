import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { DIGIT_BY_COLOR, ResistorBandsInput } from '../resistor.model';

export function validateResistorBands(control: AbstractControl): ValidationErrors | null {
  const value = control.value as ResistorBandsInput | null;
  if (!value) {
    return null;
  }

  const digit1 = DIGIT_BY_COLOR[value.digit1];
  const digit2 = DIGIT_BY_COLOR[value.digit2];
  const digit3 = DIGIT_BY_COLOR[value.digit3];

  if (digit1 === null || digit2 === null) {
    return { invalidDigits: true };
  }

  if (value.bandCount !== 4 && digit3 === null) {
    return { invalidDigit3: true };
  }

  return null;
}

export const resistorBandsValidator: ValidatorFn = (control) => validateResistorBands(control);
