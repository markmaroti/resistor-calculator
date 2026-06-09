import { describe, it, expect, beforeEach } from 'vitest';
import { VoltsPipe } from './volts.pipe';

describe('VoltsPipe', () => {
  let pipe: VoltsPipe;

  beforeEach(() => {
    pipe = new VoltsPipe();
  });

  it('should return "0 V" for non-finite values', () => {
    expect(pipe.transform(Number.NaN)).toBe('0 V');
    expect(pipe.transform(Infinity)).toBe('0 V');
    expect(pipe.transform(-Infinity)).toBe('0 V');
  });

  it('should return "0 V" for zero or negative values', () => {
    expect(pipe.transform(0)).toBe('0 V');
    expect(pipe.transform(-5)).toBe('0 V');
  });

  it('should format values in volts (V)', () => {
    expect(pipe.transform(5)).toBe('5.00 V');
    expect(pipe.transform(2.5)).toBe('2.50 V');
    expect(pipe.transform(12)).toBe('12.0 V');
  });

  it('should format values in millivolts (mV)', () => {
    expect(pipe.transform(0.5)).toBe('500 mV');
    expect(pipe.transform(0.025)).toBe('25.0 mV');
    expect(pipe.transform(0.001)).toBe('1.00 mV');
  });

  it('should format values in microvolts (μV)', () => {
    expect(pipe.transform(0.0005)).toBe('500 μV');
    expect(pipe.transform(0.000001)).toBe('1.00 μV');
  });

  it('should format values in kilovolts (kV)', () => {
    expect(pipe.transform(1500)).toBe('1.50 kV');
    expect(pipe.transform(12_000)).toBe('12.0 kV');
    expect(pipe.transform(120_000)).toBe('120 kV');
  });
});
