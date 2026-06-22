import { describe, expect, it } from 'vitest';

import { buildResistanceCopyText } from './resistance-copy-text.util';

describe('buildResistanceCopyText', () => {
  it('formats ohms only', () => {
    const text = buildResistanceCopyText({
      ohms: 1000,
      tolerancePct: null,
      tcrPpm: null,
    });

    expect(text).toBe('1.00 kΩ');
  });

  it('formats ohms with tolerance', () => {
    const text = buildResistanceCopyText({
      ohms: 4700,
      tolerancePct: 5,
      tcrPpm: null,
    });

    expect(text).toBe('4.70 kΩ ± 5%');
  });

  it('formats ohms with tolerance and tcr', () => {
    const text = buildResistanceCopyText({
      ohms: 3300,
      tolerancePct: 1,
      tcrPpm: 5,
    });

    expect(text).toBe('3.30 kΩ ± 1% (5 ppm/°C)');
  });
});
