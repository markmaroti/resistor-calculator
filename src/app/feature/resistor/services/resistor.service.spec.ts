import {
  BandCount,
  Color,
  ResistanceErrorCode,
  ReverseErrorCode,
  ReverseInput,
  ReverseMode,
} from '../resistor.model';
import { ResistorService } from './resistor.service';

describe('ResistorService', () => {
  const service = new ResistorService();

  const buildInput = (
    overrides: Partial<Parameters<ResistorService['calculateResistanceFromBands']>[0]> = {},
  ) => ({
    bandCount: 4 as BandCount,
    digit1: Color.Brown,
    digit2: Color.Black,
    digit3: Color.Black,
    multiplier: Color.Black,
    tolerance: Color.Gold,
    tcr: Color.Brown,
    ...overrides,
  });

  const buildReverseInput = (overrides: Partial<ReverseInput> = {}): ReverseInput => ({
    bandCount: 4,
    targetOhms: 1_000,
    tolerancePct: null,
    tcrPpm: null,
    mode: ReverseMode.Exact,
    ...overrides,
  });

  it('calculates resistance for 4-band input', () => {
    const result = service.calculateResistanceFromBands(
      buildInput({
        bandCount: 4,
        digit1: Color.Brown,
        digit2: Color.Black,
        multiplier: Color.Red,
        tolerance: Color.Gold,
      }),
    );

    expect(result.ohms).toBe(1_000);
    expect(result.tolerancePct).toBe(5);
    expect(result.tcrPpm).toBeNull();
  });

  it('calculates resistance for 5-band input', () => {
    const result = service.calculateResistanceFromBands(
      buildInput({
        bandCount: 5,
        digit1: Color.Red,
        digit2: Color.Green,
        digit3: Color.Black,
        multiplier: Color.Brown,
        tolerance: Color.Red,
      }),
    );

    expect(result.ohms).toBe(2_500);
    expect(result.tolerancePct).toBe(2);
    expect(result.tcrPpm).toBeNull();
  });

  it('calculates resistance for 6-band input', () => {
    const result = service.calculateResistanceFromBands(
      buildInput({
        bandCount: 6,
        digit1: Color.Orange,
        digit2: Color.Orange,
        digit3: Color.Black,
        multiplier: Color.Brown,
        tolerance: Color.Brown,
        tcr: Color.Violet,
      }),
    );

    expect(result.ohms).toBe(3_300);
    expect(result.tolerancePct).toBe(1);
    expect(result.tcrPpm).toBe(5);
  });

  it('returns zero when digit colors are invalid', () => {
    const result = service.calculateResistanceFromBands(
      buildInput({
        digit1: Color.Gold,
      }),
    );

    expect(result).toEqual({ ohms: 0, tolerancePct: null, tcrPpm: null });
  });

  it('returns explicit error when digit colors are invalid', () => {
    const result = service.calculateResistance(
      buildInput({
        digit1: Color.Gold,
      }),
    );

    expect(result.data).toEqual({ ohms: 0, tolerancePct: null, tcrPpm: null });
    expect(result.error).toEqual({
      code: ResistanceErrorCode.InvalidDigitColor,
      message: 'Digit bands must be a valid color (not Gold/Silver).',
    });
  });

  it('returns explicit error when third digit is invalid for 5-band', () => {
    const result = service.calculateResistance(
      buildInput({
        bandCount: 5,
        digit3: Color.Gold,
      }),
    );

    expect(result.data).toEqual({ ohms: 0, tolerancePct: null, tcrPpm: null });
    expect(result.error).toEqual({
      code: ResistanceErrorCode.InvalidThirdDigitColor,
      message: 'Band 3 must be a valid digit color for 5- and 6-band resistors.',
    });
  });

  it('calculates reverse candidates for 4-band exact match', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        bandCount: 4,
        targetOhms: 1_000,
        tolerancePct: 5,
      }),
    );

    expect(result.error).toBeNull();
    expect(result.data.candidates.length).toBeGreaterThan(0);
    expect(result.data.candidates[0].bands.bandCount).toBe(4);
    expect(result.data.candidates[0].ohms).toBe(1_000);
    expect(result.data.candidates[0].deltaOhms).toBe(0);
  });

  it('calculates reverse candidates for 5-band exact match', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        bandCount: 5,
        targetOhms: 2_500,
        tolerancePct: 2,
      }),
    );

    expect(result.error).toBeNull();
    expect(result.data.candidates.length).toBeGreaterThan(0);
    expect(result.data.candidates[0].bands.bandCount).toBe(5);
    expect(result.data.candidates[0].ohms).toBe(2_500);
  });

  it('calculates reverse candidates for 6-band with tcr filter', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        bandCount: 6,
        targetOhms: 3_300,
        tolerancePct: 1,
        tcrPpm: 5,
      }),
    );

    expect(result.error).toBeNull();
    expect(result.data.candidates.length).toBeGreaterThan(0);
    expect(result.data.candidates[0].bands.bandCount).toBe(6);
    expect(result.data.candidates[0].tcrPpm).toBe(5);
  });

  it('returns INVALID_TARGET_OHMS for non-positive target', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        targetOhms: 0,
      }),
    );

    expect(result.error?.code).toBe(ReverseErrorCode.InvalidTargetOhms);
    expect(result.data.candidates).toEqual([]);
  });

  it('returns NO_CANDIDATES when tolerance filter has no matching color', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        targetOhms: 1_000,
        tolerancePct: 3,
      }),
    );

    expect(result.error?.code).toBe(ReverseErrorCode.NoCandidates);
    expect(result.data.candidates).toEqual([]);
  });

  it('returns deterministic sorted candidates in nearest mode', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        bandCount: 5,
        targetOhms: 2_510,
        mode: ReverseMode.Nearest,
      }),
    );

    expect(result.error).toBeNull();
    expect(result.data.candidates.length).toBeGreaterThan(1);

    const candidates = result.data.candidates;
    for (let index = 0; index < candidates.length - 1; index += 1) {
      const current = candidates[index];
      const next = candidates[index + 1];

      expect(current.deltaOhms).toBeLessThanOrEqual(next.deltaOhms);
      if (current.deltaOhms === next.deltaOhms) {
        expect(current.deltaPct).toBeLessThanOrEqual(next.deltaPct);
      }
    }
  });

  it('enforces candidate limit in nearest mode', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        bandCount: 6,
        targetOhms: 1_234,
        mode: ReverseMode.Nearest,
      }),
    );

    expect(result.error).toBeNull();
    expect(result.data.candidates.length).toBeLessThanOrEqual(50);
  });

  it('returns NO_CANDIDATES for exact mode when target cannot be represented', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        bandCount: 4,
        targetOhms: 1_234,
        mode: ReverseMode.Exact,
      }),
    );

    expect(result.error?.code).toBe(ReverseErrorCode.NoCandidates);
    expect(result.data.candidates).toEqual([]);
  });

  it('returns NO_CANDIDATES for very small target below representable range', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        bandCount: 4,
        targetOhms: 0.01,
        mode: ReverseMode.Nearest,
      }),
    );

    expect(result.error?.code).toBe(ReverseErrorCode.NoCandidates);
    expect(result.data.candidates).toEqual([]);
  });

  it('returns nearest candidates for very large target values', () => {
    const targetOhms = 998_000_000_000;
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        bandCount: 6,
        targetOhms,
        mode: ReverseMode.Nearest,
      }),
    );

    expect(result.error).toBeNull();
    expect(result.data.candidates.length).toBeGreaterThan(0);
    expect(result.data.candidates[0].deltaOhms).toBeLessThan(targetOhms);
  });

  it('returns NO_CANDIDATES when 6-band tcr filter does not match any color', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        bandCount: 6,
        targetOhms: 3_300,
        tcrPpm: 999,
      }),
    );

    expect(result.error?.code).toBe(ReverseErrorCode.NoCandidates);
    expect(result.data.candidates).toEqual([]);
  });

  it('ignores tcrPpm input for 4-band reverse calculation', () => {
    const result = service.calculateBandsFromResistance(
      buildReverseInput({
        bandCount: 4,
        targetOhms: 1_000,
        tcrPpm: 5,
      }),
    );

    expect(result.error).toBeNull();
    expect(result.data.candidates.length).toBeGreaterThan(0);
    expect(result.data.candidates.every((candidate) => candidate.tcrPpm === null)).toBe(true);
  });
});
