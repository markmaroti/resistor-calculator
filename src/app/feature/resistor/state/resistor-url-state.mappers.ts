import { ReverseFormValue, ResistorBandsInput } from '@resistor/resistor.model';

import { ResistorUrlState, UrlBandCountValue } from './url-state.model';

export type CalculatorMode = 'forward' | 'reverse';

export function toResistorUrlState(
  mode: CalculatorMode,
  forward: ResistorBandsInput,
  reverse: ReverseFormValue,
): ResistorUrlState {
  return {
    mode,
    forward: {
      bandCount: toUrlBandCountValue(forward.bandCount),
      digit1: forward.digit1,
      digit2: forward.digit2,
      digit3: forward.digit3,
      multiplier: forward.multiplier,
      tolerance: forward.tolerance,
      tcr: forward.tcr,
    },
    reverse: {
      targetInput: reverse.targetInput,
      bandCount: toUrlBandCountValue(reverse.bandCount),
      tolerancePct: reverse.tolerancePct !== null ? String(reverse.tolerancePct) : undefined,
      tcrPpm: reverse.tcrPpm !== null ? String(reverse.tcrPpm) : undefined,
      mode: reverse.mode,
    },
  };
}

function toUrlBandCountValue(value: 4 | 5 | 6): UrlBandCountValue {
  return String(value) as UrlBandCountValue;
}
