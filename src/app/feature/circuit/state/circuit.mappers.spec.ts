import { describe, expect, it } from 'vitest';

import { toDividerInput, toParallelInput, toSeriesInput } from './circuit.mappers';

describe('circuit mappers', () => {
  it('maps series resistor inputs through shared SI parser', () => {
    const result = toSeriesInput({
      resistors: ['4.7k', '330'],
    });

    expect(result).toEqual({
      resistors: [4_700, 330],
    });
  });

  it('maps parallel resistor inputs through shared SI parser', () => {
    const result = toParallelInput({
      resistors: ['1M', '2.2k'],
    });

    expect(result).toEqual({
      resistors: [1_000_000, 2_200],
    });
  });

  it('maps divider resistor fields through shared SI parser', () => {
    const result = toDividerInput({
      vin: '5',
      r1: '1k',
      r2: '2M',
    });

    expect(result).toEqual({
      vin: 5,
      r1: 1_000,
      r2: 2_000_000,
    });
  });

  it('keeps vin numeric parse behavior via parseFloat scope', () => {
    const result = toDividerInput({
      vin: '4.7k',
      r1: '1k',
      r2: '2k',
    });

    expect(result.vin).toBe(4.7);
    expect(result.r1).toBe(1_000);
    expect(result.r2).toBe(2_000);
  });
});
