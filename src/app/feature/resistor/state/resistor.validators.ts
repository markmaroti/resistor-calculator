import { required, schema, validate } from '@angular/forms/signals';

import {
  ResistanceValueErrorCode,
  parseResistanceValue,
} from '@shared/utils/resistance-value.util';
import { isBlank, toValidationError } from '@shared/utils/signal-forms.util';

import {
  BandCount,
  Color,
  ResistanceErrorCode,
  ResistorBandsInput,
  isDigitColor,
} from '@resistor/resistor.model';

import {
  getReverseParseValidationMessage,
  getResistanceValidationMessage,
} from './validation-messages';

export type ResistorDigitColorValidationError = {
  kind: 'digitColor';
  code: ResistanceErrorCode;
};

export function validateDigitColor(color: Color): ResistorDigitColorValidationError | null {
  if (isDigitColor(color)) {
    return null;
  }

  return { kind: 'digitColor', code: ResistanceErrorCode.InvalidDigitColor };
}

export function validateThirdDigitColor(
  color: Color,
  bandCount: BandCount,
): ResistorDigitColorValidationError | null {
  // 4-band resistors don't have a band 3 (see `calculateSignificantValue()`), so it's exempt here.
  if (bandCount === 4 || isDigitColor(color)) {
    return null;
  }

  return { kind: 'digitColor', code: ResistanceErrorCode.InvalidThirdDigitColor };
}

export type ReverseTargetInputValidationError = {
  kind: 'reverseTargetInput';
  code: ResistanceValueErrorCode;
};

export function validateReverseTargetInput(
  value: string,
): ReverseTargetInputValidationError | null {
  if (isBlank(value)) {
    return null; // required() already reports the blank case
  }

  const parsed = parseResistanceValue(value);
  if (parsed.error) {
    return { kind: 'reverseTargetInput', code: parsed.error.code };
  }

  return null;
}

const REQUIRED_TARGET_MESSAGE = getReverseParseValidationMessage(
  ResistanceValueErrorCode.EmptyInput,
);

export const resistorBandsSchema = schema<ResistorBandsInput>((path) => {
  validate(path.digit1, ({ value }) =>
    toValidationError(validateDigitColor(value()), getResistanceValidationMessage),
  );
  validate(path.digit2, ({ value }) =>
    toValidationError(validateDigitColor(value()), getResistanceValidationMessage),
  );
  validate(path.digit3, ({ value, valueOf }) =>
    toValidationError(
      validateThirdDigitColor(value(), valueOf(path.bandCount)),
      getResistanceValidationMessage,
    ),
  );
});

export const reverseTargetInputSchema = schema<string>((path) => {
  required(path, { message: REQUIRED_TARGET_MESSAGE });

  validate(path, ({ value }) =>
    toValidationError(validateReverseTargetInput(value()), getReverseParseValidationMessage),
  );
});
