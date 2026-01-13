import { describe, it, expect, beforeEach } from 'vitest';
import { OhmsPipe } from './ohms-pipe';

describe('OhmsPipe', () => {
  let pipe: OhmsPipe;

  beforeEach(() => {
    pipe = new OhmsPipe();
  });

  it('should return "0 Ω" for non-finite values', () => {
    expect(pipe.transform(Number.NaN)).toBe('0 Ω');
    expect(pipe.transform(Infinity)).toBe('0 Ω');
    expect(pipe.transform(-Infinity)).toBe('0 Ω');
  });

  it('should return "0 Ω" for zero or negative values', () => {
    expect(pipe.transform(0)).toBe('0 Ω');
    expect(pipe.transform(-1)).toBe('0 Ω');
  });

  it('should format values in ohms (Ω)', () => {
    expect(pipe.transform(1)).toBe('1.00 Ω');
    expect(pipe.transform(4.7)).toBe('4.70 Ω');
    expect(pipe.transform(470)).toBe('470 Ω');
  });

  it('should format values in kilo-ohms (kΩ)', () => {
    expect(pipe.transform(1_000)).toBe('1.00 kΩ');
    expect(pipe.transform(4_700)).toBe('4.70 kΩ');
    expect(pipe.transform(47_000)).toBe('47.0 kΩ');
    expect(pipe.transform(470_000)).toBe('470 kΩ');
  });

  it('should format values in mega-ohms (MΩ)', () => {
    expect(pipe.transform(1_000_000)).toBe('1.00 MΩ');
    expect(pipe.transform(4_700_000)).toBe('4.70 MΩ');
    expect(pipe.transform(47_000_000)).toBe('47.0 MΩ');
  });

  it('should format values in giga-ohms (GΩ)', () => {
    expect(pipe.transform(1_000_000_000)).toBe('1.00 GΩ');
    expect(pipe.transform(12_000_000_000)).toBe('12.0 GΩ');
    expect(pipe.transform(123_000_000_000)).toBe('123 GΩ');
  });
});
