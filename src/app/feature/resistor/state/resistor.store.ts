import { Injectable, computed, inject, signal } from '@angular/core';
import { apply, form } from '@angular/forms/signals';

import { parseResistanceValue } from '@shared/utils/resistance-value.util';

import { ResistorService } from '@resistor/services/resistor.service';
import {
  BAND_COLOR_KEY,
  Color,
  DEFAULT_BAND_COUNT,
  ResistorBandsInput,
  ReverseCandidate,
  ReverseFormValue,
  ReverseMode,
  ReverseResult,
  isBandColorRelevant,
  isColor,
  isDigitColor,
  isTcrColor,
  isToleranceColor,
  type BandCount,
} from '@resistor/resistor.model';

import { toReverseInput, toReverseViewModel, toViewModel } from './resistor.mappers';
import { ResistorUrlState, UrlBandCountValue, toBandCount } from './url-state.model';
import { resistorBandsSchema, reverseTargetInputSchema } from './resistor.validators';
import {
  getReverseServiceValidationMessage,
  getResistanceValidationMessage,
} from './validation-messages';

@Injectable()
export class ResistorStore {
  private readonly service = inject(ResistorService);

  private readonly emptyReverseResultValue: ReverseResult = {
    data: { candidates: [] },
    error: null,
  };

  private readonly defaultBandsInput: ResistorBandsInput = {
    bandCount: DEFAULT_BAND_COUNT,
    digit1: Color.Brown,
    digit2: Color.Black,
    digit3: Color.Black,
    multiplier: Color.Black,
    tolerance: Color.Gold,
    tcr: Color.Brown,
  };

  private readonly formModel = signal<ResistorBandsInput>({ ...this.defaultBandsInput });

  public readonly form = form(this.formModel, (path) => {
    apply(path, resistorBandsSchema);
  });

  private readonly defaultReverseFormValue: ReverseFormValue = {
    targetInput: '1k',
    bandCount: DEFAULT_BAND_COUNT,
    tolerancePct: null,
    tcrPpm: null,
    mode: ReverseMode.Exact,
  };

  private readonly reverseFormModel = signal<ReverseFormValue>({
    ...this.defaultReverseFormValue,
  });

  public readonly reverseForm = form(this.reverseFormModel, (path) => {
    apply(path.targetInput, reverseTargetInputSchema);
  });

  public readonly viewModel = computed(() => {
    const input = this.form().value();
    const resistanceResult = this.service.calculateResistance(input);

    return toViewModel(input, resistanceResult);
  });

  public readonly validationMessage = computed(() => {
    const fieldMessage = this.form().errorSummary()[0]?.message ?? '';
    if (fieldMessage) {
      return fieldMessage;
    }

    const calculationError = this.viewModel().calculationError;
    if (!calculationError) {
      return '';
    }

    return getResistanceValidationMessage(calculationError.code);
  });

  public readonly reverseViewModel = computed(() => {
    const value = this.reverseForm().value();
    const parsed = parseResistanceValue(value.targetInput);

    if (parsed.error) {
      return toReverseViewModel(value, parsed, this.emptyReverseResultValue);
    }

    const reverseInput = toReverseInput(value, parsed.data.normalizedOhms);
    const result = this.service.calculateBandsFromResistance(reverseInput);
    return toReverseViewModel(value, parsed, result);
  });

  public readonly reverseValidationMessage = computed(() => {
    const fieldMessage = this.reverseForm().errorSummary()[0]?.message ?? '';
    if (fieldMessage) {
      return fieldMessage;
    }

    const vm = this.reverseViewModel();
    if (vm.serviceErrorCode) {
      return getReverseServiceValidationMessage(vm.serviceErrorCode);
    }

    return '';
  });

  public readonly isAtDefaults = computed(() => {
    const value = this.form().value();

    return (
      value.bandCount === this.defaultBandsInput.bandCount &&
      value.digit1 === this.defaultBandsInput.digit1 &&
      value.digit2 === this.defaultBandsInput.digit2 &&
      value.digit3 === this.defaultBandsInput.digit3 &&
      value.multiplier === this.defaultBandsInput.multiplier &&
      value.tolerance === this.defaultBandsInput.tolerance &&
      value.tcr === this.defaultBandsInput.tcr
    );
  });

  public resetToDefaults(): void {
    this.form().reset({ ...this.defaultBandsInput });
  }

  public applyCandidate(candidate: ReverseCandidate): void {
    this.formModel.set({ ...candidate.bands });
  }

  public hydrateFromUrlState(state: ResistorUrlState): void {
    const forwardPatch = this.toForwardFormPatch(state.forward, this.form().value());
    if (Object.keys(forwardPatch).length > 0) {
      this.formModel.update((current) => ({ ...current, ...forwardPatch }));
    }

    const reversePatch = this.toReverseFormPatch(state.reverse, this.reverseForm().value());
    if (Object.keys(reversePatch).length > 0) {
      this.reverseFormModel.update((current) => ({ ...current, ...reversePatch }));
    }
  }

  private toForwardFormPatch(
    state: ResistorUrlState['forward'],
    current: ResistorBandsInput,
  ): Partial<ResistorBandsInput> {
    const patch: Partial<ResistorBandsInput> = {};

    const bandCount = this.toOptionalBandCount(state?.bandCount);
    this.setPatchValueIfChanged(patch, current, 'bandCount', bandCount);

    const effectiveBandCount = bandCount ?? current.bandCount;

    const digit1 = this.toColorIf(state?.digit1, isDigitColor);
    this.setPatchValueIfChanged(patch, current, 'digit1', digit1);

    const digit2 = this.toColorIf(state?.digit2, isDigitColor);
    this.setPatchValueIfChanged(patch, current, 'digit2', digit2);

    if (isBandColorRelevant(effectiveBandCount, BAND_COLOR_KEY.Digit3)) {
      const digit3 = this.toColorIf(state?.digit3, isDigitColor);
      this.setPatchValueIfChanged(patch, current, 'digit3', digit3);
    }

    const multiplier = this.toKnownColor(state?.multiplier);
    this.setPatchValueIfChanged(patch, current, 'multiplier', multiplier);

    const tolerance = this.toColorIf(state?.tolerance, isToleranceColor);
    this.setPatchValueIfChanged(patch, current, 'tolerance', tolerance);

    if (isBandColorRelevant(effectiveBandCount, BAND_COLOR_KEY.Tcr)) {
      const tcr = this.toColorIf(state?.tcr, isTcrColor);
      this.setPatchValueIfChanged(patch, current, 'tcr', tcr);
    }

    return patch;
  }

  private toReverseFormPatch(
    state: ResistorUrlState['reverse'],
    current: ReverseFormValue,
  ): Partial<ReverseFormValue> {
    const patch: Partial<ReverseFormValue> = {};

    const targetInput = this.toNonEmptyString(state?.targetInput);
    this.setPatchValueIfChanged(patch, current, 'targetInput', targetInput);

    const bandCount = this.toOptionalBandCount(state?.bandCount);
    this.setPatchValueIfChanged(patch, current, 'bandCount', bandCount);

    const tolerancePct = this.toPositiveNumber(state?.tolerancePct);
    this.setPatchValueIfChanged(patch, current, 'tolerancePct', tolerancePct);

    const tcrPpm = this.toPositiveNumber(state?.tcrPpm);
    this.setPatchValueIfChanged(patch, current, 'tcrPpm', tcrPpm);

    const mode = this.toReverseMode(state?.mode);
    this.setPatchValueIfChanged(patch, current, 'mode', mode);

    return patch;
  }

  private toOptionalBandCount(value: UrlBandCountValue | undefined): BandCount | undefined {
    return value === undefined ? undefined : toBandCount(value);
  }

  private toKnownColor(value: string | undefined): Color | undefined {
    return value !== undefined && isColor(value) ? value : undefined;
  }

  private toColorIf(
    value: string | undefined,
    isValid: (color: Color) => boolean,
  ): Color | undefined {
    const color = this.toKnownColor(value);
    return color !== undefined && isValid(color) ? color : undefined;
  }

  private toReverseMode(value: string | undefined): ReverseMode | undefined {
    if (value === undefined) {
      return undefined;
    }

    return value === ReverseMode.Exact || value === ReverseMode.Nearest ? value : undefined;
  }

  private toNonEmptyString(value: string | undefined): string | undefined {
    if (value === undefined) {
      return undefined;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  private toPositiveNumber(value: string | undefined): number | undefined {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }

  private setPatchValueIfChanged<T extends object, K extends keyof T>(
    patch: Partial<T>,
    current: T,
    key: K,
    nextValue: T[K] | undefined,
  ): void {
    if (nextValue !== undefined && nextValue !== current[key]) {
      patch[key] = nextValue;
    }
  }
}
