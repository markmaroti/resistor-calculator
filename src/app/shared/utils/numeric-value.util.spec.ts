import { describe, expect, it } from 'vitest';

import { parseStrictNumber } from './numeric-value.util';

describe('parseStrictNumber', () => {
  it('parses a plain decimal number', () => {
    expect(parseStrictNumber('4.7')).toBe(4.7);
    expect(parseStrictNumber('-12')).toBe(-12);
  });

  it('rejects SI-suffixed input (Number() already returns NaN for this, unlike parseFloat)', () => {
    expect(parseStrictNumber('4.7k')).toBeNaN();
    expect(parseStrictNumber('5V')).toBeNaN();
  });

  it('rejects hex, octal, and binary numeric literal syntax', () => {
    expect(parseStrictNumber('0x10')).toBeNaN();
    expect(parseStrictNumber('0o17')).toBeNaN();
    expect(parseStrictNumber('0b101')).toBeNaN();
  });

  it('rejects signed hex/octal/binary too (Number() already returns NaN for these natively)', () => {
    expect(parseStrictNumber('-0x10')).toBeNaN();
    expect(parseStrictNumber('+0b101')).toBeNaN();
  });

  it('rejects a hex string that would otherwise misparse as scientific notation', () => {
    // Number('0x1e5') is 485 (hex), not 100000 (1e5) -- exactly the silent-misparse case this guards against.
    expect(parseStrictNumber('0x1e5')).toBeNaN();
  });

  it('still accepts scientific notation, which is unambiguous decimal syntax', () => {
    expect(parseStrictNumber('1e3')).toBe(1_000);
  });

  it('returns NaN for non-numeric input', () => {
    expect(parseStrictNumber('abc')).toBeNaN();
  });
});
