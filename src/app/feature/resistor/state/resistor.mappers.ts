import {
  ReverseFormValue,
  ReverseInput,
  ReverseResult,
  ReverseErrorCode,
  ResistanceCalculationResult,
  ResistorBandsInput,
  ServiceError,
  ResistanceErrorCode,
} from '@resistor/resistor.model';
import { ParseReverseValueResult, ReverseValueErrorCode } from '@resistor/utils/reverse-value.util';

export type ResistorViewModel = {
  bandCount: ResistorBandsInput['bandCount'];
  digit1: ResistorBandsInput['digit1'];
  digit2: ResistorBandsInput['digit2'];
  digit3: ResistorBandsInput['digit3'];
  multiplier: ResistorBandsInput['multiplier'];
  tolerance: ResistorBandsInput['tolerance'];
  tcr: ResistorBandsInput['tcr'];
  ohms: number;
  tolerancePct: number | null;
  tcrPpm: number | null;
  calculationError: ServiceError<ResistanceErrorCode> | null;
  showDigit3: boolean;
  showTcr: boolean;
};

export type ReverseViewModel = {
  targetInput: string;
  targetOhms: number;
  bandCount: ReverseFormValue['bandCount'];
  tolerancePct: ReverseFormValue['tolerancePct'];
  tcrPpm: ReverseFormValue['tcrPpm'];
  mode: ReverseFormValue['mode'];
  isValidTarget: boolean;
  parseErrorCode: ReverseValueErrorCode | null;
  serviceErrorCode: ReverseErrorCode | null;
  candidates: ReverseResult['data']['candidates'];
  showTcr: boolean;
};

export function toResistorInput(value: ResistorBandsInput): ResistorBandsInput {
  return {
    bandCount: value.bandCount,
    digit1: value.digit1,
    digit2: value.digit2,
    digit3: value.digit3,
    multiplier: value.multiplier,
    tolerance: value.tolerance,
    tcr: value.tcr,
  };
}

export function toViewModel(
  input: ResistorBandsInput,
  result: ResistanceCalculationResult,
): ResistorViewModel {
  return {
    bandCount: input.bandCount,
    digit1: input.digit1,
    digit2: input.digit2,
    digit3: input.digit3,
    multiplier: input.multiplier,
    tolerance: input.tolerance,
    tcr: input.tcr,
    ohms: result.data.ohms,
    tolerancePct: result.data.tolerancePct,
    tcrPpm: result.data.tcrPpm,
    calculationError: result.error,
    showDigit3: input.bandCount !== 4,
    showTcr: input.bandCount === 6,
  };
}

export function toReverseInput(formValue: ReverseFormValue, targetOhms: number): ReverseInput {
  return {
    bandCount: formValue.bandCount,
    targetOhms,
    tolerancePct: formValue.tolerancePct,
    tcrPpm: formValue.tcrPpm,
    mode: formValue.mode,
  };
}

export function toReverseViewModel(
  formValue: ReverseFormValue,
  parsedValue: ParseReverseValueResult,
  reverseResult: ReverseResult,
): ReverseViewModel {
  const parseErrorCode = parsedValue.error?.code ?? null;
  const serviceErrorCode = reverseResult.error?.code ?? null;
  return {
    targetInput: formValue.targetInput,
    targetOhms: parsedValue.data.normalizedOhms,
    bandCount: formValue.bandCount,
    tolerancePct: formValue.tolerancePct,
    tcrPpm: formValue.tcrPpm,
    mode: formValue.mode,
    isValidTarget: parseErrorCode === null,
    parseErrorCode,
    serviceErrorCode,
    candidates: reverseResult.data.candidates,
    showTcr: formValue.bandCount === 6,
  };
}
