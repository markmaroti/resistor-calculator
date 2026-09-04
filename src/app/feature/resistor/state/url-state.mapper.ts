import {
  BAND_COLOR_KEY,
  BAND_COUNTS,
  BandColorKey,
  DIGIT_BY_COLOR,
  MULTIPLIER_BY_COLOR,
  TCR_BY_COLOR,
  TOLERANCE_BY_COLOR,
  isBandColorRelevant,
} from '@resistor/resistor.model';

import {
  ForwardUrlState,
  ResistorUrlQueryParamMap,
  ResistorUrlState,
  ReverseUrlState,
  URL_CALCULATOR_MODE,
  URL_REVERSE_MODE,
  URL_STATE_PARAM_KEY,
  URL_STATE_PARAM_ORDER,
  UrlBandCountValue,
  UrlCalculatorMode,
  UrlStateParamKey,
  UrlReverseMode,
  toBandCount,
} from './url-state.model';

const BAND_COUNT_VALUES = new Set(BAND_COUNTS.map((count) => String(count)));
const DIGIT_COLORS = new Set(
  Object.entries(DIGIT_BY_COLOR)
    .filter(([, digit]) => digit !== null)
    .map(([color]) => color),
);
const MULTIPLIER_COLORS = new Set(Object.keys(MULTIPLIER_BY_COLOR));
const TOLERANCE_COLORS = new Set(Object.keys(TOLERANCE_BY_COLOR));
const TCR_COLORS = new Set(Object.keys(TCR_BY_COLOR));

export function toQueryParams(state: ResistorUrlState): ResistorUrlQueryParamMap {
  const mode = normalizeCalculatorMode(state.mode);
  const forward = state.forward;
  const reverse = state.reverse;
  const bandCount = normalizeBandCount(forward?.bandCount);

  const values: ResistorUrlQueryParamMap = {
    [URL_STATE_PARAM_KEY.Mode]: mode,
    [URL_STATE_PARAM_KEY.BandCount]: bandCount,
    [URL_STATE_PARAM_KEY.Digit1]: normalizeDigitColor(forward?.digit1),
    [URL_STATE_PARAM_KEY.Digit2]: normalizeDigitColor(forward?.digit2),
    [URL_STATE_PARAM_KEY.Digit3]:
      bandCount && isForwardBandColorRelevant(bandCount, BAND_COLOR_KEY.Digit3)
        ? normalizeDigitColor(forward?.digit3)
        : undefined,
    [URL_STATE_PARAM_KEY.Multiplier]: normalizeMultiplierColor(forward?.multiplier),
    [URL_STATE_PARAM_KEY.Tolerance]: normalizeToleranceColor(forward?.tolerance),
    [URL_STATE_PARAM_KEY.Tcr]:
      bandCount && isForwardBandColorRelevant(bandCount, BAND_COLOR_KEY.Tcr)
        ? normalizeTcrColor(forward?.tcr)
        : undefined,
    [URL_STATE_PARAM_KEY.ReverseTargetInput]:
      mode === URL_CALCULATOR_MODE.Reverse
        ? normalizeTrimmedValue(reverse?.targetInput)
        : undefined,
    [URL_STATE_PARAM_KEY.ReverseBandCount]:
      mode === URL_CALCULATOR_MODE.Reverse ? normalizeBandCount(reverse?.bandCount) : undefined,
    [URL_STATE_PARAM_KEY.ReverseTolerancePct]:
      mode === URL_CALCULATOR_MODE.Reverse
        ? normalizePositiveNumericString(reverse?.tolerancePct)
        : undefined,
    [URL_STATE_PARAM_KEY.ReverseTcrPpm]:
      mode === URL_CALCULATOR_MODE.Reverse
        ? normalizePositiveNumericString(reverse?.tcrPpm)
        : undefined,
    [URL_STATE_PARAM_KEY.ReverseMode]:
      mode === URL_CALCULATOR_MODE.Reverse ? normalizeReverseMode(reverse?.mode) : undefined,
  };

  return URL_STATE_PARAM_ORDER.reduce<ResistorUrlQueryParamMap>((params, key) => {
    const value = values[key];
    if (value !== undefined) {
      params[key] = value;
    }

    return params;
  }, {});
}

export function fromQueryParams(
  query: Record<string, string | string[] | null | undefined>,
): ResistorUrlState {
  const mode = normalizeCalculatorMode(getSingleQueryValue(query, URL_STATE_PARAM_KEY.Mode));

  const forwardBandCount = normalizeBandCount(
    getSingleQueryValue(query, URL_STATE_PARAM_KEY.BandCount),
  );
  const forward = compactObject<ForwardUrlState>({
    bandCount: forwardBandCount,
    digit1: normalizeDigitColor(getSingleQueryValue(query, URL_STATE_PARAM_KEY.Digit1)),
    digit2: normalizeDigitColor(getSingleQueryValue(query, URL_STATE_PARAM_KEY.Digit2)),
    digit3:
      forwardBandCount && isForwardBandColorRelevant(forwardBandCount, BAND_COLOR_KEY.Digit3)
        ? normalizeDigitColor(getSingleQueryValue(query, URL_STATE_PARAM_KEY.Digit3))
        : undefined,
    multiplier: normalizeMultiplierColor(
      getSingleQueryValue(query, URL_STATE_PARAM_KEY.Multiplier),
    ),
    tolerance: normalizeToleranceColor(getSingleQueryValue(query, URL_STATE_PARAM_KEY.Tolerance)),
    tcr:
      forwardBandCount && isForwardBandColorRelevant(forwardBandCount, BAND_COLOR_KEY.Tcr)
        ? normalizeTcrColor(getSingleQueryValue(query, URL_STATE_PARAM_KEY.Tcr))
        : undefined,
  });

  const reverse =
    mode === URL_CALCULATOR_MODE.Reverse
      ? compactObject<ReverseUrlState>({
          targetInput: normalizeTrimmedValue(
            getSingleQueryValue(query, URL_STATE_PARAM_KEY.ReverseTargetInput),
          ),
          bandCount: normalizeBandCount(
            getSingleQueryValue(query, URL_STATE_PARAM_KEY.ReverseBandCount),
          ),
          tolerancePct: normalizePositiveNumericString(
            getSingleQueryValue(query, URL_STATE_PARAM_KEY.ReverseTolerancePct),
          ),
          tcrPpm: normalizePositiveNumericString(
            getSingleQueryValue(query, URL_STATE_PARAM_KEY.ReverseTcrPpm),
          ),
          mode: normalizeReverseMode(getSingleQueryValue(query, URL_STATE_PARAM_KEY.ReverseMode)),
        })
      : undefined;

  const state: ResistorUrlState = {};
  if (mode !== undefined) {
    state.mode = mode;
  }
  if (forward !== undefined) {
    state.forward = forward;
  }
  if (reverse !== undefined) {
    state.reverse = reverse;
  }

  return state;
}

function getSingleQueryValue(
  query: Record<string, string | string[] | null | undefined>,
  key: UrlStateParamKey,
): string | undefined {
  const value = query[key];
  if (Array.isArray(value)) {
    return value[0];
  }

  return typeof value === 'string' ? value : undefined;
}

function normalizeCalculatorMode(value: string | undefined): UrlCalculatorMode | undefined {
  return isCalculatorMode(value) ? value : undefined;
}

function normalizeReverseMode(value: string | undefined): UrlReverseMode | undefined {
  return isReverseMode(value) ? value : undefined;
}

function normalizeBandCount(value: string | undefined): UrlBandCountValue | undefined {
  return isBandCountValue(value) ? value : undefined;
}

function normalizeDigitColor(value: string | undefined): string | undefined {
  return normalizeOptionalValue(value, isDigitColor);
}

function normalizeMultiplierColor(value: string | undefined): string | undefined {
  return normalizeOptionalValue(value, isMultiplierColor);
}

function normalizeToleranceColor(value: string | undefined): string | undefined {
  return normalizeOptionalValue(value, isToleranceColor);
}

function normalizeTcrColor(value: string | undefined): string | undefined {
  return normalizeOptionalValue(value, isTcrColor);
}

function normalizeOptionalValue(
  value: string | undefined,
  isValid: (input: string) => boolean,
): string | undefined {
  if (!value) {
    return undefined;
  }

  return isValid(value) ? value : undefined;
}

function normalizeTrimmedValue(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function normalizePositiveNumericString(value: string | undefined): string | undefined {
  const normalized = normalizeTrimmedValue(value);
  if (!normalized) {
    return undefined;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return normalized;
}

function isCalculatorMode(value: unknown): value is UrlCalculatorMode {
  return value === URL_CALCULATOR_MODE.Forward || value === URL_CALCULATOR_MODE.Reverse;
}

function isReverseMode(value: unknown): value is UrlReverseMode {
  return value === URL_REVERSE_MODE.Exact || value === URL_REVERSE_MODE.Nearest;
}

function isBandCountValue(value: unknown): value is UrlBandCountValue {
  return typeof value === 'string' && BAND_COUNT_VALUES.has(value);
}

function isDigitColor(value: string): boolean {
  return DIGIT_COLORS.has(value);
}

function isMultiplierColor(value: string): boolean {
  return MULTIPLIER_COLORS.has(value);
}

function isToleranceColor(value: string): boolean {
  return TOLERANCE_COLORS.has(value);
}

function isTcrColor(value: string): boolean {
  return TCR_COLORS.has(value);
}

function isForwardBandColorRelevant(bandCount: UrlBandCountValue, key: BandColorKey): boolean {
  return isBandColorRelevant(toBandCount(bandCount), key);
}

function compactObject<T extends object>(value: T): T | undefined {
  return Object.values(value).some((item) => item !== undefined) ? value : undefined;
}
