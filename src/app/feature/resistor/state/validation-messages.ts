import { ReverseErrorCode, ResistanceErrorCode } from '@resistor/resistor.model';
import { ReverseValueErrorCode } from '@resistor/utils/reverse-value.util';

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

export const REVERSE_VALUE_VALIDATION_MESSAGES: Record<ReverseValueErrorCode, string> = {
  [ReverseValueErrorCode.EmptyInput]: 'Resistance value is required.',
  [ReverseValueErrorCode.InvalidFormat]:
    'Invalid resistance format. Use examples like 4.7k, 4700, 1M.',
  [ReverseValueErrorCode.InvalidNumber]: 'Resistance number is invalid.',
  [ReverseValueErrorCode.UnsupportedUnit]: 'Unsupported unit. Use Ω, kΩ, MΩ, or GΩ.',
  [ReverseValueErrorCode.NonPositiveValue]: 'Resistance value must be greater than 0.',
  [ReverseValueErrorCode.NonFiniteValue]: 'Resistance value must be finite.',
};

export function getReverseValidationMessage(
  code: ReverseValueErrorCode | ReverseErrorCode,
): string {
  if (code in REVERSE_VALUE_VALIDATION_MESSAGES) {
    return REVERSE_VALUE_VALIDATION_MESSAGES[code as ReverseValueErrorCode];
  }
  return REVERSE_SERVICE_VALIDATION_MESSAGES[code as ReverseErrorCode];
}
