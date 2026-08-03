import type { ServiceResult } from './service-result.util';

export const ResistanceValueUnit = {
  Ohm: 'Ω',
  KiloOhm: 'kΩ',
  MegaOhm: 'MΩ',
  GigaOhm: 'GΩ',
} as const;

export type ResistanceValueUnit = (typeof ResistanceValueUnit)[keyof typeof ResistanceValueUnit];

export type ParsedResistanceValue = {
  source: string;
  normalizedOhms: number;
  unit: ResistanceValueUnit;
  multiplier: number;
};

export const ResistanceValueErrorCode = {
  EmptyInput: 'EMPTY_INPUT',
  InvalidFormat: 'INVALID_FORMAT',
  InvalidNumber: 'INVALID_NUMBER',
  UnsupportedUnit: 'UNSUPPORTED_UNIT',
  NonPositiveValue: 'NON_POSITIVE_VALUE',
  NonFiniteValue: 'NON_FINITE_VALUE',
} as const;

export type ResistanceValueErrorCode =
  (typeof ResistanceValueErrorCode)[keyof typeof ResistanceValueErrorCode];

export const RESISTANCE_VALUE_MESSAGES: Record<ResistanceValueErrorCode, string> = {
  [ResistanceValueErrorCode.EmptyInput]: 'Resistance value is required.',
  [ResistanceValueErrorCode.InvalidFormat]:
    'Invalid resistance format. Use examples like 4.7k, 4700, 1M.',
  [ResistanceValueErrorCode.InvalidNumber]: 'Resistance number is invalid.',
  [ResistanceValueErrorCode.UnsupportedUnit]: 'Unsupported unit. Use Ω, kΩ, MΩ, or GΩ.',
  [ResistanceValueErrorCode.NonPositiveValue]: 'Resistance value must be greater than 0.',
  [ResistanceValueErrorCode.NonFiniteValue]: 'Resistance value must be finite.',
};

export type ParseResistanceValueResult = ServiceResult<
  ParsedResistanceValue,
  ResistanceValueErrorCode
>;

const UNIT_ALIASES: Record<string, ResistanceValueUnit> = {
  '': ResistanceValueUnit.Ohm,
  ω: ResistanceValueUnit.Ohm,
  Ω: ResistanceValueUnit.Ohm,
  ohm: ResistanceValueUnit.Ohm,
  ohms: ResistanceValueUnit.Ohm,
  k: ResistanceValueUnit.KiloOhm,
  kω: ResistanceValueUnit.KiloOhm,
  kΩ: ResistanceValueUnit.KiloOhm,
  kohm: ResistanceValueUnit.KiloOhm,
  kohms: ResistanceValueUnit.KiloOhm,
  m: ResistanceValueUnit.MegaOhm,
  mω: ResistanceValueUnit.MegaOhm,
  mΩ: ResistanceValueUnit.MegaOhm,
  mohm: ResistanceValueUnit.MegaOhm,
  mohms: ResistanceValueUnit.MegaOhm,
  g: ResistanceValueUnit.GigaOhm,
  gω: ResistanceValueUnit.GigaOhm,
  gΩ: ResistanceValueUnit.GigaOhm,
  gohm: ResistanceValueUnit.GigaOhm,
  gohms: ResistanceValueUnit.GigaOhm,
};

const UNIT_MULTIPLIER: Record<ResistanceValueUnit, number> = {
  [ResistanceValueUnit.Ohm]: 1,
  [ResistanceValueUnit.KiloOhm]: 1_000,
  [ResistanceValueUnit.MegaOhm]: 1_000_000,
  [ResistanceValueUnit.GigaOhm]: 1_000_000_000,
};

export function parseResistanceValue(source: string): ParseResistanceValueResult {
  const normalizedSource = source.trim();
  if (!normalizedSource) {
    return buildError(ResistanceValueErrorCode.EmptyInput);
  }

  const match = normalizedSource.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(?:\s*([a-zA-ZΩω]+))?$/);
  if (!match) {
    return buildError(ResistanceValueErrorCode.InvalidFormat);
  }

  const numericPart = match[1];
  const unitPart = normalizeUnitToken(match[2] ?? '');
  const numericValue = Number(numericPart);

  if (Number.isNaN(numericValue)) {
    return buildError(ResistanceValueErrorCode.InvalidNumber);
  }

  if (!Number.isFinite(numericValue)) {
    return buildError(ResistanceValueErrorCode.NonFiniteValue);
  }

  if (numericValue <= 0) {
    return buildError(ResistanceValueErrorCode.NonPositiveValue);
  }

  const resolvedUnit = UNIT_ALIASES[unitPart];
  if (!resolvedUnit) {
    return buildError(ResistanceValueErrorCode.UnsupportedUnit);
  }

  const multiplier = UNIT_MULTIPLIER[resolvedUnit];
  const normalizedOhms = numericValue * multiplier;

  if (!Number.isFinite(normalizedOhms)) {
    return buildError(ResistanceValueErrorCode.NonFiniteValue);
  }

  return {
    data: {
      source,
      normalizedOhms,
      unit: resolvedUnit,
      multiplier,
    },
    error: null,
  };
}

function normalizeUnitToken(unitToken: string): string {
  return unitToken.replace('Ω', 'ω').toLowerCase();
}

function buildError(code: ResistanceValueErrorCode): ParseResistanceValueResult {
  return {
    data: {
      source: '',
      normalizedOhms: 0,
      unit: ResistanceValueUnit.Ohm,
      multiplier: 1,
    },
    error: { code, message: RESISTANCE_VALUE_MESSAGES[code] },
  };
}
