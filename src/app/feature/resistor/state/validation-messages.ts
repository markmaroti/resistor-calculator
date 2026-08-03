import {
  RESISTANCE_VALUE_MESSAGES,
  ResistanceValueErrorCode,
} from '@shared/utils/resistance-value.util';

import { ReverseErrorCode, ResistanceErrorCode } from '@resistor/resistor.model';

export const RESISTOR_VALIDATION_MESSAGES: Record<ResistanceErrorCode, string> = {
  [ResistanceErrorCode.InvalidDigitColor]: 'Digit bands must be a valid color (not Gold/Silver).',
  [ResistanceErrorCode.InvalidThirdDigitColor]:
    'Band 3 must be a valid digit color for 5- and 6-band resistors.',
};

export function getResistanceValidationMessage(code: ResistanceErrorCode): string {
  return RESISTOR_VALIDATION_MESSAGES[code];
}

export const REVERSE_SERVICE_VALIDATION_MESSAGES: Record<ReverseErrorCode, string> = {
  [ReverseErrorCode.InvalidTargetOhms]: 'Target resistance must be a finite number greater than 0.',
  [ReverseErrorCode.UnsupportedBandCount]:
    'Only 4, 5, and 6 band reverse calculation is supported.',
  [ReverseErrorCode.NoCandidates]: 'No matching resistor bands found for the selected input.',
};

export function getReverseValidationMessage(
  code: ResistanceValueErrorCode | ReverseErrorCode,
): string {
  if (code in RESISTANCE_VALUE_MESSAGES) {
    return RESISTANCE_VALUE_MESSAGES[code as ResistanceValueErrorCode];
  }
  return REVERSE_SERVICE_VALIDATION_MESSAGES[code as ReverseErrorCode];
}
