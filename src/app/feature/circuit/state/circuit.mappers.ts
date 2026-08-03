import { parseResistanceValue } from '@shared/utils/resistance-value.util';

import {
  CircuitErrorCode,
  CircuitServiceError,
  CircuitServiceResult,
  DividerFormValue,
  DividerInput,
  DividerResult,
  ResistorListData,
  ResistorListFormValue,
  ResistorListInput,
} from '@circuit/circuit.model';

export type ResistorListViewModel = {
  resistors: string[];
  totalOhms: number | null;
  error: CircuitServiceError<CircuitErrorCode> | null;
};

export type SeriesViewModel = ResistorListViewModel;
export type ParallelViewModel = ResistorListViewModel;

export type DividerViewModel = {
  vin: string;
  r1: string;
  r2: string;
  vout: number | null;
  current: number | null;
  error: CircuitServiceError<CircuitErrorCode> | null;
};

export function toResistorListInput(value: ResistorListFormValue): ResistorListInput {
  return {
    resistors: value.resistors.map((r) => parseResistanceToOhms(r)),
  };
}

export const toSeriesInput = toResistorListInput;
export const toParallelInput = toResistorListInput;

export function toDividerInput(value: DividerFormValue): DividerInput {
  return {
    vin: parseFloat(value.vin),
    r1: parseResistanceToOhms(value.r1),
    r2: parseResistanceToOhms(value.r2),
  };
}

export function toResistorListViewModel(
  value: ResistorListFormValue,
  result: CircuitServiceResult<ResistorListData, CircuitErrorCode>,
): ResistorListViewModel {
  return {
    resistors: value.resistors,
    totalOhms: result.error ? null : result.data.totalOhms,
    error: result.error,
  };
}

export const toSeriesViewModel = toResistorListViewModel;
export const toParallelViewModel = toResistorListViewModel;

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

function parseResistanceToOhms(value: string): number {
  const parsed = parseResistanceValue(value);
  return parsed.data.normalizedOhms;
}
