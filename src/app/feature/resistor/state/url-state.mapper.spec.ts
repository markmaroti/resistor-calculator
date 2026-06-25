import { describe, expect, it } from 'vitest';

import { URL_CALCULATOR_MODE, URL_STATE_PARAM_KEY, URL_STATE_PARAM_ORDER } from './url-state.model';
import { fromQueryParams, toQueryParams } from './url-state.mapper';

describe('url state mapper', () => {
  it('serializes forward mode with stable key order and relevant fields only', () => {
    const params = toQueryParams({
      mode: URL_CALCULATOR_MODE.Forward,
      forward: {
        bandCount: '4',
        digit1: 'Brown',
        digit2: 'Black',
        digit3: 'Red',
        multiplier: 'Red',
        tolerance: 'Gold',
        tcr: 'Blue',
      },
      reverse: {
        targetInput: '2.2k',
        bandCount: '6',
        tolerancePct: '1',
        tcrPpm: '25',
        mode: 'NEAREST',
      },
    });

    expect(params).toEqual({
      mode: 'forward',
      bc: '4',
      d1: 'Brown',
      d2: 'Black',
      m: 'Red',
      t: 'Gold',
    });
    expect(Object.keys(params)).toEqual(
      URL_STATE_PARAM_ORDER.filter((key) => key in params) as string[],
    );
  });

  it('serializes reverse mode including reverse fields', () => {
    const params = toQueryParams({
      mode: URL_CALCULATOR_MODE.Reverse,
      forward: {
        bandCount: '6',
        digit1: 'Red',
        digit2: 'Violet',
        digit3: 'Black',
        multiplier: 'Orange',
        tolerance: 'Brown',
        tcr: 'Blue',
      },
      reverse: {
        targetInput: ' 2.2k ',
        bandCount: '6',
        tolerancePct: '1',
        tcrPpm: '25',
        mode: 'NEAREST',
      },
    });

    expect(params).toEqual({
      mode: 'reverse',
      bc: '6',
      d1: 'Red',
      d2: 'Violet',
      d3: 'Black',
      m: 'Orange',
      t: 'Brown',
      tc: 'Blue',
      rti: '2.2k',
      rbc: '6',
      rt: '1',
      rtc: '25',
      rm: 'NEAREST',
    });
  });

  it('keeps canonical query params stable through round-trip serialization', () => {
    const first = toQueryParams({
      mode: URL_CALCULATOR_MODE.Reverse,
      forward: {
        bandCount: '6',
        digit1: 'Red',
        digit2: 'Violet',
        digit3: 'Black',
        multiplier: 'Orange',
        tolerance: 'Brown',
        tcr: 'Blue',
      },
      reverse: {
        targetInput: ' 4.7k ',
        bandCount: '6',
        tolerancePct: '1.0',
        tcrPpm: '25',
        mode: 'NEAREST',
      },
    });

    const parsed = fromQueryParams(first);
    const second = toQueryParams(parsed);

    expect(second).toEqual(first);
  });

  it('parses valid query params into forward and reverse url state', () => {
    const state = fromQueryParams({
      mode: 'reverse',
      bc: '6',
      d1: 'Red',
      d2: 'Violet',
      d3: 'Black',
      m: 'Orange',
      t: 'Brown',
      tc: 'Blue',
      rti: '2.2k',
      rbc: '6',
      rt: '1',
      rtc: '25',
      rm: 'NEAREST',
    });

    expect(state).toEqual({
      mode: 'reverse',
      forward: {
        bandCount: '6',
        digit1: 'Red',
        digit2: 'Violet',
        digit3: 'Black',
        multiplier: 'Orange',
        tolerance: 'Brown',
        tcr: 'Blue',
      },
      reverse: {
        targetInput: '2.2k',
        bandCount: '6',
        tolerancePct: '1',
        tcrPpm: '25',
        mode: 'NEAREST',
      },
    });
  });

  it('ignores unknown and invalid query params', () => {
    const state = fromQueryParams({
      mode: 'invalid',
      bc: '7',
      d1: 'Pink',
      d2: 'Black',
      m: 'invalid',
      t: 'invalid',
      tc: 'Blue',
      rti: '   ',
      rbc: '4',
      rt: '0',
      rtc: '-5',
      rm: 'INVALID',
      unknown: 'value',
    });

    expect(state).toEqual({
      forward: {
        digit2: 'Black',
      },
    });
  });

  it('drops irrelevant 4-band fields during canonical parse+serialize', () => {
    const canonical = toQueryParams(
      fromQueryParams({
        mode: 'forward',
        bc: '4',
        d1: 'Brown',
        d2: 'Black',
        d3: 'Red',
        m: 'Black',
        t: 'Gold',
        tc: 'Blue',
      }),
    );

    expect(canonical).toEqual({
      mode: 'forward',
      bc: '4',
      d1: 'Brown',
      d2: 'Black',
      m: 'Black',
      t: 'Gold',
    });
  });

  it('supports partial reverse-only query state when mode is reverse', () => {
    const state = fromQueryParams({
      mode: 'reverse',
      rti: ' 1k ',
    });

    expect(state).toEqual({
      mode: 'reverse',
      reverse: {
        targetInput: '1k',
      },
    });
    expect(toQueryParams(state)).toEqual({
      mode: 'reverse',
      rti: '1k',
    });
  });

  it('keeps valid reverse fields while filtering invalid reverse fields', () => {
    const state = fromQueryParams({
      mode: 'reverse',
      rbc: '9',
      rt: '0',
      rtc: '25',
      rm: 'NEAREST',
    });

    expect(state).toEqual({
      mode: 'reverse',
      reverse: {
        tcrPpm: '25',
        mode: 'NEAREST',
      },
    });
    expect(toQueryParams(state)).toEqual({
      mode: 'reverse',
      rtc: '25',
      rm: 'NEAREST',
    });
  });

  it('uses first value when query param appears multiple times', () => {
    const state = fromQueryParams({
      [URL_STATE_PARAM_KEY.Mode]: ['reverse', 'forward'],
      [URL_STATE_PARAM_KEY.BandCount]: ['6', '4'],
      [URL_STATE_PARAM_KEY.Digit1]: ['Red', 'Brown'],
      [URL_STATE_PARAM_KEY.ReverseTargetInput]: ['3.3k', '1k'],
    });

    expect(state).toEqual({
      mode: 'reverse',
      forward: {
        bandCount: '6',
        digit1: 'Red',
      },
      reverse: {
        targetInput: '3.3k',
      },
    });
  });
});
