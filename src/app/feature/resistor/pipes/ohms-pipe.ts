import { Pipe, PipeTransform } from '@angular/core';

type OhmUnit = {
  factor: number;
  symbol: string;
};

const OHM_UNITS: readonly OhmUnit[] = [
  { factor: 1e9, symbol: 'GΩ' },
  { factor: 1e6, symbol: 'MΩ' },
  { factor: 1e3, symbol: 'kΩ' },
  { factor: 1, symbol: 'Ω' },
] as const;

const DEFAULT_OHM_UNIT = OHM_UNITS[OHM_UNITS.length - 1];

@Pipe({
  name: 'ohms',
})
export class OhmsPipe implements PipeTransform {
  transform(value: number): string {
    if (!Number.isFinite(value) || value <= 0) {
      return '0 Ω';
    }

    const unit = OHM_UNITS.find(({ factor }) => value >= factor) ?? DEFAULT_OHM_UNIT;
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
}
