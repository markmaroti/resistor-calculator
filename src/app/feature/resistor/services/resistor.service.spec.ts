import { BandCount, Color } from '../resistor.model';
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
});
