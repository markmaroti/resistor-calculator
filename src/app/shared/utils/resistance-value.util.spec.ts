import { describe, expect, it } from 'vitest';
import {
  parseResistanceValue,
  ResistanceValueErrorCode,
  ResistanceValueUnit,
} from './resistance-value.util';

describe('parseResistanceValue', () => {
  it('parses plain ohm value without explicit unit', () => {
    const result = parseResistanceValue('4700');

    expect(result.error).toBeNull();
    expect(result.data.normalizedOhms).toBe(4700);
    expect(result.data.unit).toBe(ResistanceValueUnit.Ohm);
  });

  it('parses kilo-ohm shorthand input', () => {
    const result = parseResistanceValue('4.7k');

    expect(result.error).toBeNull();
    expect(result.data.normalizedOhms).toBe(4700);
    expect(result.data.unit).toBe(ResistanceValueUnit.KiloOhm);
  });

  it('parses mega-ohm shorthand input', () => {
    const result = parseResistanceValue('1M');

    expect(result.error).toBeNull();
    expect(result.data.normalizedOhms).toBe(1_000_000);
    expect(result.data.unit).toBe(ResistanceValueUnit.MegaOhm);
  });

  it('parses giga-ohm input with symbol', () => {
    const result = parseResistanceValue('2.2 GΩ');

    expect(result.error).toBeNull();
    expect(result.data.normalizedOhms).toBe(2_200_000_000);
    expect(result.data.unit).toBe(ResistanceValueUnit.GigaOhm);
  });

  it('parses ohm alias input', () => {
    const result = parseResistanceValue('330 ohm');

    expect(result.error).toBeNull();
    expect(result.data.normalizedOhms).toBe(330);
    expect(result.data.unit).toBe(ResistanceValueUnit.Ohm);
  });

  it('returns EMPTY_INPUT for blank input', () => {
    const result = parseResistanceValue('   ');

    expect(result.error?.code).toBe(ResistanceValueErrorCode.EmptyInput);
  });

  it('returns INVALID_FORMAT for malformed input', () => {
    const result = parseResistanceValue('4..7k');

    expect(result.error?.code).toBe(ResistanceValueErrorCode.InvalidFormat);
  });

  it('returns UNSUPPORTED_UNIT for unknown unit', () => {
    const result = parseResistanceValue('10x');

    expect(result.error?.code).toBe(ResistanceValueErrorCode.UnsupportedUnit);
  });

  it('returns NON_POSITIVE_VALUE for zero or negative input', () => {
    const zero = parseResistanceValue('0');
    const negative = parseResistanceValue('-5k');

    expect(zero.error?.code).toBe(ResistanceValueErrorCode.NonPositiveValue);
    expect(negative.error?.code).toBe(ResistanceValueErrorCode.NonPositiveValue);
  });

  it('returns INVALID_FORMAT for Infinity input', () => {
    const result = parseResistanceValue('Infinity');

    expect(result.error?.code).toBe(ResistanceValueErrorCode.InvalidFormat);
  });
});
