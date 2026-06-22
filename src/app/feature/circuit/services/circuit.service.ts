import { Injectable } from '@angular/core';

import {
  CircuitErrorCode,
  DividerInput,
  DividerResult,
  ParallelInput,
  ParallelResult,
  SeriesInput,
  SeriesResult,
} from '@circuit/circuit.model';

@Injectable({ providedIn: 'root' })
export class CircuitService {
  public calculateSeries(input: SeriesInput): SeriesResult {
    if (input.resistors.length === 0) {
      return {
        data: { totalOhms: 0 },
        error: {
          code: CircuitErrorCode.EmptyInput,
          message: 'At least one resistor is required.',
        },
      };
    }

    for (const r of input.resistors) {
      if (!CircuitService.isValidResistorValue(r)) {
        return {
          data: { totalOhms: 0 },
          error: {
            code: CircuitErrorCode.InvalidResistor,
            message: `Invalid resistor value: ${r}.`,
          },
        };
      }
    }

    const totalOhms = input.resistors.reduce((sum, r) => sum + r, 0);
    return { data: { totalOhms }, error: null };
  }

  public calculateParallel(input: ParallelInput): ParallelResult {
    if (input.resistors.length === 0) {
      return {
        data: { totalOhms: 0 },
        error: {
          code: CircuitErrorCode.EmptyInput,
          message: 'At least one resistor is required.',
        },
      };
    }

    for (const r of input.resistors) {
      if (!CircuitService.isValidResistorValue(r)) {
        return {
          data: { totalOhms: 0 },
          error: {
            code: CircuitErrorCode.InvalidResistor,
            message: `Invalid resistor value: ${r}.`,
          },
        };
      }
    }

    const sumOfConductance = input.resistors.reduce((sum, r) => sum + 1 / r, 0);
    const totalOhms = 1 / sumOfConductance;
    return { data: { totalOhms }, error: null };
  }

  public calculateDivider(input: DividerInput): DividerResult {
    if (!CircuitService.isValidResistorValue(input.vin)) {
      return {
        data: { vout: 0, current: 0 },
        error: {
          code: CircuitErrorCode.InvalidResistor,
          message: `Invalid voltage: ${input.vin}.`,
        },
      };
    }

    if (!CircuitService.isValidResistorValue(input.r1)) {
      return {
        data: { vout: 0, current: 0 },
        error: {
          code: CircuitErrorCode.InvalidResistor,
          message: `Invalid R1: ${input.r1}.`,
        },
      };
    }

    if (!CircuitService.isValidResistorValue(input.r2)) {
      return {
        data: { vout: 0, current: 0 },
        error: {
          code: CircuitErrorCode.InvalidResistor,
          message: `Invalid R2: ${input.r2}.`,
        },
      };
    }

    const totalR = input.r1 + input.r2;
    const current = input.vin / totalR;
    const vout = current * input.r2;
    return { data: { vout, current }, error: null };
  }

  private static isValidResistorValue(value: number): boolean {
    return Number.isFinite(value) && value > 0;
  }
}
