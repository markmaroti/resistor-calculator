import { calculateResistanceFromBands } from './resistor.utils';
import { Color } from './resistor.model';

describe('calculateResistanceFromBands', () => {
  const makeInput = (
    overrides: Partial<Parameters<typeof calculateResistanceFromBands>[0]> = {}
  ) => ({
    bandCount: 4 as const,
    digit1: Color.Brown,
    digit2: Color.Black,
    digit3: Color.Black,
    multiplier: Color.Red,
    tolerance: Color.Gold,
    tcr: Color.Brown,
    ...overrides,
  });

  it('should calculate resistance for a 4-band resistor', () => {
    const result = calculateResistanceFromBands(
      makeInput({
        bandCount: 4,
        digit1: Color.Brown,
        digit2: Color.Black,
        multiplier: Color.Red,
        tolerance: Color.Gold,
      })
    );

    expect(result.ohms).toBe(1000);
    expect(result.tolerancePct).toBe(5);
    expect(result.tcrPpm).toBeNull();
  });

  it('should calculate resistance for a 5-band resistor using three significant digits', () => {
    const result = calculateResistanceFromBands(
      makeInput({
        bandCount: 5,
        digit1: Color.Brown,
        digit2: Color.Black,
        digit3: Color.Red,
        multiplier: Color.Orange,
        tolerance: Color.Brown,
      })
    );

    expect(result.ohms).toBe(102000);
    expect(result.tolerancePct).toBe(1);
    expect(result.tcrPpm).toBeNull();
  });

  it('should include TCR value for a 6-band resistor', () => {
    const result = calculateResistanceFromBands(
      makeInput({
        bandCount: 6,
        digit1: Color.Brown,
        digit2: Color.Black,
        digit3: Color.Red,
        multiplier: Color.Orange,
        tolerance: Color.Brown,
        tcr: Color.Brown,
      })
    );

    expect(result.ohms).toBe(102000);
    expect(result.tolerancePct).toBe(1);
    expect(result.tcrPpm).toBe(100);
  });

  it('should return zero resistance when any required digit is invalid', () => {
    const result = calculateResistanceFromBands(
      makeInput({
        bandCount: 4,
        digit1: Color.Gold,
        digit2: Color.Black,
      })
    );

    expect(result.ohms).toBe(0);
    expect(result.tolerancePct).toBeNull();
    expect(result.tcrPpm).toBeNull();
  });

  it('should return zero resistance when the third digit is invalid for 5-band resistors', () => {
    const result = calculateResistanceFromBands(
      makeInput({
        bandCount: 5,
        digit1: Color.Brown,
        digit2: Color.Black,
        digit3: Color.Gold,
        multiplier: Color.Red,
      })
    );

    expect(result.ohms).toBe(0);
  });
});
