import type {
  ServiceError as CircuitServiceError,
  ServiceResult as CircuitServiceResult,
} from '@shared/utils/service-result.util';

export type { CircuitServiceError, CircuitServiceResult };

export const CircuitErrorCode = {
  EmptyInput: 'EMPTY_INPUT',
  InvalidResistor: 'INVALID_RESISTOR',
  DivisionByZero: 'DIVISION_BY_ZERO',
} as const;

export type CircuitErrorCode = (typeof CircuitErrorCode)[keyof typeof CircuitErrorCode];

export type ResistorListInput = {
  resistors: number[];
};

export type DividerInput = {
  vin: number;
  r1: number;
  r2: number;
};

export type ResistorListData = {
  totalOhms: number;
};

export type DividerData = {
  vout: number;
  current: number;
};

export type SeriesResult = CircuitServiceResult<ResistorListData, CircuitErrorCode>;
export type ParallelResult = CircuitServiceResult<ResistorListData, CircuitErrorCode>;
export type DividerResult = CircuitServiceResult<DividerData, CircuitErrorCode>;

export type CircuitResult = SeriesResult | ParallelResult | DividerResult;

export const CircuitValidationError = {
  EmptyInput: 'EMPTY_INPUT',
  InvalidFormat: 'INVALID_FORMAT',
  NonPositiveValue: 'NON_POSITIVE_VALUE',
  NonFiniteValue: 'NON_FINITE_VALUE',
} as const;

export type CircuitValidationError =
  (typeof CircuitValidationError)[keyof typeof CircuitValidationError];

export type ResistorListFormValue = {
  resistors: string[];
};

export type DividerFormValue = {
  vin: string;
  r1: string;
  r2: string;
};

export type CircuitTab = 'series' | 'parallel' | 'divider';

export type ResistorListTab = Exclude<CircuitTab, 'divider'>;
