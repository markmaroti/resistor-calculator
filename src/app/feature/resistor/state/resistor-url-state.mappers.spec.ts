import { describe, expect, it } from 'vitest';

import {
  Color,
  ReverseMode,
  type ReverseFormValue,
  type ResistorBandsInput,
} from '@resistor/resistor.model';

import { toResistorUrlState } from './resistor-url-state.mappers';

describe('toResistorUrlState', () => {
  it('maps forward and reverse forms to URL state', () => {
    const forward: ResistorBandsInput = {
      bandCount: 6,
      digit1: Color.Red,
      digit2: Color.Violet,
      digit3: Color.Black,
      multiplier: Color.Orange,
      tolerance: Color.Brown,
      tcr: Color.Blue,
    };

    const reverse: ReverseFormValue = {
      targetInput: '2.2k',
      bandCount: 6,
      tolerancePct: 1,
      tcrPpm: 25,
      mode: ReverseMode.Nearest,
    };

    expect(toResistorUrlState('reverse', forward, reverse)).toEqual({
      mode: 'reverse',
      forward: {
        bandCount: '6',
        digit1: Color.Red,
        digit2: Color.Violet,
        digit3: Color.Black,
        multiplier: Color.Orange,
        tolerance: Color.Brown,
        tcr: Color.Blue,
      },
      reverse: {
        targetInput: '2.2k',
        bandCount: '6',
        tolerancePct: '1',
        tcrPpm: '25',
        mode: ReverseMode.Nearest,
      },
    });
  });

  it('keeps nullable reverse values undefined in URL state', () => {
    const forward: ResistorBandsInput = {
      bandCount: 4,
      digit1: Color.Brown,
      digit2: Color.Black,
      digit3: Color.Black,
      multiplier: Color.Black,
      tolerance: Color.Gold,
      tcr: Color.Brown,
    };

    const reverse: ReverseFormValue = {
      targetInput: '1k',
      bandCount: 4,
      tolerancePct: null,
      tcrPpm: null,
      mode: ReverseMode.Exact,
    };

    expect(toResistorUrlState('forward', forward, reverse)).toEqual({
      mode: 'forward',
      forward: {
        bandCount: '4',
        digit1: Color.Brown,
        digit2: Color.Black,
        digit3: Color.Black,
        multiplier: Color.Black,
        tolerance: Color.Gold,
        tcr: Color.Brown,
      },
      reverse: {
        targetInput: '1k',
        bandCount: '4',
        tolerancePct: undefined,
        tcrPpm: undefined,
        mode: ReverseMode.Exact,
      },
    });
  });
});
