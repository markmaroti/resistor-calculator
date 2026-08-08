import { Injectable, computed, inject, signal } from '@angular/core';
import { form } from '@angular/forms/signals';

import { parseResistanceValue } from '@shared/utils/resistance-value.util';

import { ResistorService } from '@resistor/services/resistor.service';
import {
  Color,
  DEFAULT_BAND_COUNT,
  ResistorBandsInput,
  ReverseCandidate,
  ReverseFormValue,
  ReverseMode,
  ReverseResult,
  type BandCount,
} from '@resistor/resistor.model';

import { toReverseInput, toReverseViewModel, toViewModel } from './resistor.mappers';
import { ResistorUrlState, UrlBandCountValue } from './url-state.model';
import {
  getReverseParseValidationMessage,
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

  public readonly form = form(this.formModel);

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

  public readonly reverseForm = form(this.reverseFormModel);

  public readonly viewModel = computed(() => {
    const input = this.form().value();
    const resistanceResult = this.service.calculateResistance(input);

    return toViewModel(input, resistanceResult);
  });

  public readonly validationMessage = computed(() => {
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
    const vm = this.reverseViewModel();
    if (vm.parseErrorCode) {
      return getReverseParseValidationMessage(vm.parseErrorCode);
    }
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
    this.form().markAsDirty();
  }

  public hydrateFromUrlState(state: ResistorUrlState): void {
    const forwardPatch = this.toForwardFormPatch(state.forward);
    if (Object.keys(forwardPatch).length > 0) {
      this.formModel.update((current) => ({ ...current, ...forwardPatch }));
    }

    const reversePatch = this.toReverseFormPatch(state.reverse);
    if (Object.keys(reversePatch).length > 0) {
      this.reverseFormModel.update((current) => ({ ...current, ...reversePatch }));
    }
  }

  private toForwardFormPatch(state: ResistorUrlState['forward']): Partial<ResistorBandsInput> {
    const patch: Partial<ResistorBandsInput> = {};

    const bandCount = this.toBandCount(state?.bandCount);
    if (bandCount !== undefined) {
      patch.bandCount = bandCount;
    }

    const digit1 = this.toColor(state?.digit1);
    if (digit1 !== undefined) {
      patch.digit1 = digit1;
    }

    const digit2 = this.toColor(state?.digit2);
    if (digit2 !== undefined) {
      patch.digit2 = digit2;
    }

    const digit3 = this.toColor(state?.digit3);
    if (digit3 !== undefined) {
      patch.digit3 = digit3;
    }

    const multiplier = this.toColor(state?.multiplier);
    if (multiplier !== undefined) {
      patch.multiplier = multiplier;
    }

    const tolerance = this.toColor(state?.tolerance);
    if (tolerance !== undefined) {
      patch.tolerance = tolerance;
    }

    const tcr = this.toColor(state?.tcr);
    if (tcr !== undefined) {
      patch.tcr = tcr;
    }

    return patch;
  }

  private toReverseFormPatch(state: ResistorUrlState['reverse']): Partial<ReverseFormValue> {
    const patch: Partial<ReverseFormValue> = {};

    const targetInput = this.toNonEmptyString(state?.targetInput);
    if (targetInput !== undefined) {
      patch.targetInput = targetInput;
    }

    const bandCount = this.toBandCount(state?.bandCount);
    if (bandCount !== undefined) {
      patch.bandCount = bandCount;
    }

    const tolerancePct = this.toPositiveNumber(state?.tolerancePct);
    if (tolerancePct !== undefined) {
      patch.tolerancePct = tolerancePct;
    }

    const tcrPpm = this.toPositiveNumber(state?.tcrPpm);
    if (tcrPpm !== undefined) {
      patch.tcrPpm = tcrPpm;
    }

    const mode = this.toReverseMode(state?.mode);
    if (mode !== undefined) {
      patch.mode = mode;
    }

    return patch;
  }

  private toBandCount(value: UrlBandCountValue | undefined): BandCount | undefined {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number(value);
    return parsed === 4 || parsed === 5 || parsed === 6 ? parsed : undefined;
  }

  private toColor(value: string | undefined): Color | undefined {
    return value !== undefined && value in Color ? (value as Color) : undefined;
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
}
