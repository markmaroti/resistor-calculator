type SiUnit = {
  factor: number;
  symbol: string;
};

export const OHM_UNITS: readonly SiUnit[] = [
  { factor: 1e9, symbol: 'GΩ' },
  { factor: 1e6, symbol: 'MΩ' },
  { factor: 1e3, symbol: 'kΩ' },
  { factor: 1, symbol: 'Ω' },
] as const;

export const VOLT_UNITS: readonly SiUnit[] = [
  { factor: 1e3, symbol: 'kV' },
  { factor: 1, symbol: 'V' },
  { factor: 1e-3, symbol: 'mV' },
  { factor: 1e-6, symbol: 'μV' },
] as const;

export const AMP_UNITS: readonly SiUnit[] = [
  { factor: 1, symbol: 'A' },
  { factor: 1e-3, symbol: 'mA' },
  { factor: 1e-6, symbol: 'μA' },
] as const;

function formatSiValue(value: number, units: readonly SiUnit[], zeroSymbol: string): string {
  if (!Number.isFinite(value) || value <= 0) {
    return `0 ${zeroSymbol}`;
  }

  const unit = units.find(({ factor }) => value >= factor) ?? units[units.length - 1];
  const normalizedValue = value / unit.factor;

  let formattedValue: string;
  if (normalizedValue >= 100) {
    formattedValue = normalizedValue.toFixed(0);
  } else if (normalizedValue >= 10) {
    formattedValue = normalizedValue.toFixed(1);
  } else {
    formattedValue = normalizedValue.toFixed(2);
  }

  return `${formattedValue} ${unit.symbol}`;
}

export function formatOhms(value: number): string {
  return formatSiValue(value, OHM_UNITS, 'Ω');
}

export function formatVolts(value: number): string {
  return formatSiValue(value, VOLT_UNITS, 'V');
}

export function formatAmps(value: number): string {
  return formatSiValue(value, AMP_UNITS, 'A');
}
