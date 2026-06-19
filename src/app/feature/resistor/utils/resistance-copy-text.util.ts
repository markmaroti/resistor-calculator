import { formatOhms } from '@shared/utils/format-value.util';

type ResistanceCopyTextInput = {
  ohms: number;
  tolerancePct: number | null;
  tcrPpm: number | null;
};

export function buildResistanceCopyText(input: ResistanceCopyTextInput): string {
  const parts: string[] = [formatOhms(input.ohms)];

  if (input.tolerancePct !== null) {
    parts.push(`± ${input.tolerancePct}%`);
  }

  if (input.tcrPpm !== null) {
    parts.push(`(${input.tcrPpm} ppm/°C)`);
  }

  return parts.join(' ');
}
