import {
  CircuitErrorCode,
  CircuitServiceError,
  DividerFormValue,
  DividerInput,
  DividerResult,
  ParallelFormValue,
  ParallelInput,
  ParallelResult,
  SeriesFormValue,
  SeriesInput,
  SeriesResult,
} from '../circuit.model';

export type SeriesViewModel = {
  resistors: string[];
  totalOhms: number | null;
  error: CircuitServiceError<CircuitErrorCode> | null;
};

export type ParallelViewModel = {
  resistors: string[];
  totalOhms: number | null;
  error: CircuitServiceError<CircuitErrorCode> | null;
};

export type DividerViewModel = {
  vin: string;
  r1: string;
  r2: string;
  vout: number | null;
  current: number | null;
  error: CircuitServiceError<CircuitErrorCode> | null;
};

export function toSeriesInput(value: SeriesFormValue): SeriesInput {
  return {
    resistors: value.resistors.map((r) => parseFloat(r)),
  };
}

export function toParallelInput(value: ParallelFormValue): ParallelInput {
  return {
    resistors: value.resistors.map((r) => parseFloat(r)),
  };
}

export function toDividerInput(value: DividerFormValue): DividerInput {
  return {
    vin: parseFloat(value.vin),
    r1: parseFloat(value.r1),
    r2: parseFloat(value.r2),
  };
}

export function toSeriesViewModel(value: SeriesFormValue, result: SeriesResult): SeriesViewModel {
  return {
    resistors: value.resistors,
    totalOhms: result.error ? null : result.data.totalOhms,
    error: result.error,
  };
}

export function toParallelViewModel(
  value: ParallelFormValue,
  result: ParallelResult,
): ParallelViewModel {
  return {
    resistors: value.resistors,
    totalOhms: result.error ? null : result.data.totalOhms,
    error: result.error,
  };
}

export function toDividerViewModel(
  value: DividerFormValue,
  result: DividerResult,
): DividerViewModel {
  return {
    vin: value.vin,
    r1: value.r1,
    r2: value.r2,
    vout: result.error ? null : result.data.vout,
    current: result.error ? null : result.data.current,
    error: result.error,
  };
}
