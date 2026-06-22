import { describe, it, expect, beforeEach } from 'vitest';

import { AmpsPipe } from './amps.pipe';

describe('AmpsPipe', () => {
  let pipe: AmpsPipe;

  beforeEach(() => {
    pipe = new AmpsPipe();
  });

  it('should return "0 A" for non-finite values', () => {
    expect(pipe.transform(Number.NaN)).toBe('0 A');
    expect(pipe.transform(Infinity)).toBe('0 A');
    expect(pipe.transform(-Infinity)).toBe('0 A');
  });

  it('should return "0 A" for zero or negative values', () => {
    expect(pipe.transform(0)).toBe('0 A');
    expect(pipe.transform(-2.5)).toBe('0 A');
  });

  it('should format values in amps (A)', () => {
    expect(pipe.transform(1)).toBe('1.00 A');
    expect(pipe.transform(2.5)).toBe('2.50 A');
    expect(pipe.transform(12)).toBe('12.0 A');
  });

  it('should format values in milliamps (mA)', () => {
    expect(pipe.transform(0.5)).toBe('500 mA');
    expect(pipe.transform(0.025)).toBe('25.0 mA');
    expect(pipe.transform(0.001)).toBe('1.00 mA');
  });

  it('should format values in microamps (μA)', () => {
    expect(pipe.transform(0.0005)).toBe('500 μA');
    expect(pipe.transform(0.000001)).toBe('1.00 μA');
  });
});
