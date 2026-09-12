import { formatOhms } from '@shared/utils/format-value.util';

import { ResistanceData } from '@resistor/resistor.model';

export function buildResistanceCopyText(input: ResistanceData): string {
  const parts: string[] = [formatOhms(input.ohms)];

  if (input.tolerancePct !== null) {
    parts.push(`± ${input.tolerancePct}%`);
  }

  if (input.tcrPpm !== null) {
    parts.push(`(${input.tcrPpm} ppm/°C)`);
  }

  return parts.join(' ');
}
