import { CalculatorMode, ReverseFormValue, ResistorBandsFormValue } from '@resistor/resistor.model';

import { ResistorUrlState, toUrlBandCountValue } from './url-state.model';

export function toResistorUrlState(
  mode: CalculatorMode,
  forward: ResistorBandsFormValue,
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
