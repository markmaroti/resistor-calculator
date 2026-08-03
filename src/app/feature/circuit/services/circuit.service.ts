import { Injectable } from '@angular/core';

import {
  CircuitErrorCode,
  CircuitServiceError,
  DividerInput,
  DividerResult,
  ParallelResult,
  ResistorListInput,
  SeriesResult,
} from '@circuit/circuit.model';

@Injectable({ providedIn: 'root' })
export class CircuitService {
  public calculateSeries(input: ResistorListInput): SeriesResult {
    const error = CircuitService.validateResistorList(input.resistors);
    if (error) {
      return { data: { totalOhms: 0 }, error };
    }

    const totalOhms = input.resistors.reduce((sum, r) => sum + r, 0);
    return { data: { totalOhms }, error: null };
  }

  public calculateParallel(input: ResistorListInput): ParallelResult {
    const error = CircuitService.validateResistorList(input.resistors);
    if (error) {
      return { data: { totalOhms: 0 }, error };
    }

    const sumOfConductance = input.resistors.reduce((sum, r) => sum + 1 / r, 0);
    const totalOhms = 1 / sumOfConductance;
    return { data: { totalOhms }, error: null };
  }

  public calculateDivider(input: DividerInput): DividerResult {
    const error =
      CircuitService.validateField(input.vin, 'voltage') ??
      CircuitService.validateField(input.r1, 'R1') ??
      CircuitService.validateField(input.r2, 'R2');
    if (error) {
      return { data: { vout: 0, current: 0 }, error };
    }

    const totalR = input.r1 + input.r2;
    const current = input.vin / totalR;
    const vout = current * input.r2;
    return { data: { vout, current }, error: null };
  }

  private static validateResistorList(
    resistors: number[],
  ): CircuitServiceError<CircuitErrorCode> | null {
    if (resistors.length === 0) {
      return { code: CircuitErrorCode.EmptyInput, message: 'At least one resistor is required.' };
    }

    for (const r of resistors) {
      const error = CircuitService.validateField(r, 'resistor value');
      if (error) {
        return error;
      }
    }

    return null;
  }

  private static validateField(
    value: number,
    label: string,
  ): CircuitServiceError<CircuitErrorCode> | null {
    return CircuitService.isValidResistorValue(value)
      ? null
      : { code: CircuitErrorCode.InvalidResistor, message: `Invalid ${label}: ${value}.` };
  }

  private static isValidResistorValue(value: number): boolean {
    return Number.isFinite(value) && value > 0;
  }
}
