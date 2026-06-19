import { ServiceResult } from '@resistor/resistor.model';

export const ReverseValueUnit = {
  Ohm: 'Ω',
  KiloOhm: 'kΩ',
  MegaOhm: 'MΩ',
  GigaOhm: 'GΩ',
} as const;

export type ReverseValueUnit = (typeof ReverseValueUnit)[keyof typeof ReverseValueUnit];

export type ParsedResistanceValue = {
  source: string;
  normalizedOhms: number;
  unit: ReverseValueUnit;
  multiplier: number;
};

export const ReverseValueErrorCode = {
  EmptyInput: 'EMPTY_INPUT',
  InvalidFormat: 'INVALID_FORMAT',
  InvalidNumber: 'INVALID_NUMBER',
  UnsupportedUnit: 'UNSUPPORTED_UNIT',
  NonPositiveValue: 'NON_POSITIVE_VALUE',
  NonFiniteValue: 'NON_FINITE_VALUE',
} as const;

export type ReverseValueErrorCode =
  (typeof ReverseValueErrorCode)[keyof typeof ReverseValueErrorCode];

export type ParseReverseValueResult = ServiceResult<ParsedResistanceValue, ReverseValueErrorCode>;

const UNIT_ALIASES: Record<string, ReverseValueUnit> = {
  '': ReverseValueUnit.Ohm,
  ω: ReverseValueUnit.Ohm,
  Ω: ReverseValueUnit.Ohm,
  ohm: ReverseValueUnit.Ohm,
  ohms: ReverseValueUnit.Ohm,
  k: ReverseValueUnit.KiloOhm,
  kω: ReverseValueUnit.KiloOhm,
  kΩ: ReverseValueUnit.KiloOhm,
  kohm: ReverseValueUnit.KiloOhm,
  kohms: ReverseValueUnit.KiloOhm,
  m: ReverseValueUnit.MegaOhm,
  mω: ReverseValueUnit.MegaOhm,
  mΩ: ReverseValueUnit.MegaOhm,
  mohm: ReverseValueUnit.MegaOhm,
  mohms: ReverseValueUnit.MegaOhm,
  g: ReverseValueUnit.GigaOhm,
  gω: ReverseValueUnit.GigaOhm,
  gΩ: ReverseValueUnit.GigaOhm,
  gohm: ReverseValueUnit.GigaOhm,
  gohms: ReverseValueUnit.GigaOhm,
};

const UNIT_MULTIPLIER: Record<ReverseValueUnit, number> = {
  [ReverseValueUnit.Ohm]: 1,
  [ReverseValueUnit.KiloOhm]: 1_000,
  [ReverseValueUnit.MegaOhm]: 1_000_000,
  [ReverseValueUnit.GigaOhm]: 1_000_000_000,
};

export function parseResistanceValue(source: string): ParseReverseValueResult {
  const normalizedSource = source.trim();
  if (!normalizedSource) {
    return buildError(ReverseValueErrorCode.EmptyInput, 'Resistance value is required.');
  }

  const match = normalizedSource.match(/^([+-]?(?:\d+(?:\.\d+)?|\.\d+))(?:\s*([a-zA-ZΩω]+))?$/);
  if (!match) {
    return buildError(
      ReverseValueErrorCode.InvalidFormat,
      'Invalid resistance format. Use examples like 4.7k, 4700, 1M.',
    );
  }

  const numericPart = match[1];
  const unitPart = normalizeUnitToken(match[2] ?? '');
  const numericValue = Number(numericPart);

  if (Number.isNaN(numericValue)) {
    return buildError(ReverseValueErrorCode.InvalidNumber, 'Resistance number is invalid.');
  }

  if (!Number.isFinite(numericValue)) {
    return buildError(ReverseValueErrorCode.NonFiniteValue, 'Resistance value must be finite.');
  }

  if (numericValue <= 0) {
    return buildError(
      ReverseValueErrorCode.NonPositiveValue,
      'Resistance value must be greater than 0.',
    );
  }

  const resolvedUnit = UNIT_ALIASES[unitPart];
  if (!resolvedUnit) {
    return buildError(
      ReverseValueErrorCode.UnsupportedUnit,
      'Unsupported unit. Use Ω, kΩ, MΩ, or GΩ.',
    );
  }

  const multiplier = UNIT_MULTIPLIER[resolvedUnit];
  const normalizedOhms = numericValue * multiplier;

  if (!Number.isFinite(normalizedOhms)) {
    return buildError(ReverseValueErrorCode.NonFiniteValue, 'Resistance value must be finite.');
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

function buildError(code: ReverseValueErrorCode, message: string): ParseReverseValueResult {
  return {
    data: {
      source: '',
      normalizedOhms: 0,
      unit: ReverseValueUnit.Ohm,
      multiplier: 1,
    },
    error: { code, message },
  };
}
