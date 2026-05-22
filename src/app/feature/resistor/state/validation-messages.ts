import { ResistanceErrorCode } from '../resistor.model';

export const RESISTOR_VALIDATION_MESSAGES: Record<ResistanceErrorCode, string> = {
  [ResistanceErrorCode.InvalidDigitColor]: 'Digit bands must be a valid color (not Gold/Silver).',
  [ResistanceErrorCode.InvalidThirdDigitColor]:
    'Band 3 must be a valid digit color for 5- and 6-band resistors.',
};

export function getResistanceValidationMessage(code: ResistanceErrorCode): string {
  return RESISTOR_VALIDATION_MESSAGES[code];
}
