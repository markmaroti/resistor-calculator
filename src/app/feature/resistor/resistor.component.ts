import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';

import { copyTextToClipboard } from '@shared/utils/clipboard.util';

import { ResistorStore } from '@resistor/state/resistor.store';
import { buildResistanceCopyText } from '@resistor/utils/resistance-copy-text.util';
import { ModeToggleComponent } from '@resistor/components/mode-toggle/mode-toggle.component';
import { ForwardFormComponent } from '@resistor/components/forward-form/forward-form.component';
import {
  ResultCardComponent,
  CopyState,
} from '@resistor/components/result-card/result-card.component';
import { HelpSectionComponent } from '@resistor/components/help-section/help-section.component';
import { ReverseShellComponent } from '@resistor/components/reverse-shell/reverse-shell.component';
import { fromQueryParams, toQueryParams } from '@resistor/state/url-state.mapper';
import {
  ResistorUrlQueryParamMap,
  ResistorUrlState,
  URL_STATE_PARAM_ORDER,
  UrlBandCountValue,
} from '@resistor/state/url-state.model';

import {
  Color,
  DIGIT_BY_COLOR,
  MULTIPLIER_BY_COLOR,
  TCR_BY_COLOR,
  TOLERANCE_BY_COLOR,
  BAND_COUNTS,
  ReverseMode,
  ReverseErrorCode,
  ReverseCandidate,
} from './resistor.model';

type CalculatorMode = 'forward' | 'reverse';

const URL_SYNC_DEBOUNCE_MS = 250;

@Component({
  selector: 'app-resistor',
  templateUrl: './resistor.component.html',
  styleUrl: './resistor.component.scss',
  imports: [
    ReactiveFormsModule,
    ModeToggleComponent,
    ForwardFormComponent,
    ResultCardComponent,
    HelpSectionComponent,
    ReverseShellComponent,
  ],
  providers: [ResistorStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResistorComponent implements OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly store = inject(ResistorStore);
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  private applyFeedbackTimer: ReturnType<typeof setTimeout> | null = null;
  private shareLinkFeedbackTimer: ReturnType<typeof setTimeout> | null = null;
  private urlSyncTimer: ReturnType<typeof setTimeout> | null = null;
  private hasInitializedUrlSync = false;
  private lastScheduledUrlSyncFingerprint: string | null = null;

  public readonly form = this.store.form;
  public readonly viewModel = this.store.viewModel;
  public readonly validationMessage = this.store.validationMessage;
  public readonly reverseForm = this.store.reverseForm;
  public readonly reverseViewModel = this.store.reverseViewModel;
  public readonly reverseValidationMessage = this.store.reverseValidationMessage;
  public readonly isAtDefaults = this.store.isAtDefaults;

  private readonly forwardFormSyncValue = toSignal(
    this.form.valueChanges.pipe(map(() => this.form.getRawValue())),
    { initialValue: this.form.getRawValue() },
  );

  private readonly reverseFormSyncValue = toSignal(
    this.reverseForm.valueChanges.pipe(map(() => this.reverseForm.getRawValue())),
    { initialValue: this.reverseForm.getRawValue() },
  );

  private readonly isUrlSyncReady = signal(false);

  public readonly showHelp = signal(false);
  public readonly copyState = signal<CopyState>('idle');
  public readonly shareLinkCopyState = signal<CopyState>('idle');
  public readonly applyFeedback = signal('');
  public readonly mode = signal<CalculatorMode>('forward');

  public readonly calculatorModes: ReadonlyArray<{ key: CalculatorMode; label: string }> = [
    { key: 'forward', label: 'Band -> Value' },
    { key: 'reverse', label: 'Value -> Band' },
  ];

  public readonly isCopyEnabled = computed(() => this.viewModel().ohms > 0);

  public readonly digitColors = (Object.keys(DIGIT_BY_COLOR) as Color[]).filter(
    (c) => DIGIT_BY_COLOR[c] !== null,
  );
  public readonly multiplierColors = Object.keys(MULTIPLIER_BY_COLOR) as Color[];
  public readonly toleranceColors = Object.keys(TOLERANCE_BY_COLOR) as Color[];
  public readonly tcrColors = Object.keys(TCR_BY_COLOR) as Color[];
  public readonly bandCounts = BAND_COUNTS;
  public readonly reverseModes = [ReverseMode.Exact, ReverseMode.Nearest] as const;

  public readonly hasReverseError = computed(() => {
    const vm = this.reverseViewModel();
    return vm.parseErrorCode !== null || vm.serviceErrorCode === ReverseErrorCode.InvalidTargetOhms;
  });
  public readonly hasReverseNoCandidates = computed(
    () => this.reverseViewModel().serviceErrorCode === ReverseErrorCode.NoCandidates,
  );

  public constructor() {
    const state = fromQueryParams(this.route.snapshot.queryParams);
    this.store.hydrateFromUrlState(state);

    if (state.mode !== undefined) {
      this.mode.set(state.mode);
    }

    this.setupUrlSyncEffect();
    this.isUrlSyncReady.set(true);
  }

  public ngOnDestroy(): void {
    this.clearApplyFeedbackTimer();
    this.clearShareLinkFeedbackTimer();
    this.clearUrlSyncTimer();
  }

  public toggleHelp() {
    this.showHelp.update((value) => !value);
  }

  public setMode(mode: string): void {
    this.mode.set(mode as CalculatorMode);
    if (mode === 'reverse') {
      this.applyFeedback.set('');
    }
  }

  public resetToDefaults(): void {
    this.store.resetToDefaults();
  }

  public applyCandidate(candidate: ReverseCandidate): void {
    this.store.applyCandidate(candidate);
    this.setMode('forward');
    this.applyFeedback.set('Candidate applied to band form.');
    this.clearApplyFeedbackTimer();
    this.applyFeedbackTimer = setTimeout(() => this.applyFeedback.set(''), 1500);
    setTimeout(() => this.focusForwardPrimaryControl(), 0);
  }

  public async copyResult(): Promise<void> {
    if (!this.isCopyEnabled()) {
      return;
    }

    const vm = this.viewModel();
    const textToCopy = buildResistanceCopyText({
      ohms: vm.ohms,
      tolerancePct: vm.tolerancePct,
      tcrPpm: vm.tcrPpm,
    });

    const copied = await copyTextToClipboard(textToCopy);
    this.copyState.set(copied ? 'success' : 'error');
    setTimeout(() => this.copyState.set('idle'), 1500);
  }

  public async copyShareLink(): Promise<void> {
    const shareUrl = this.buildShareUrl();
    const copied = await copyTextToClipboard(shareUrl);

    this.shareLinkCopyState.set(copied ? 'success' : 'error');
    this.clearShareLinkFeedbackTimer();
    this.shareLinkFeedbackTimer = setTimeout(() => this.shareLinkCopyState.set('idle'), 1500);
  }

  private focusForwardPrimaryControl(): void {
    const host = this.hostElement.nativeElement as HTMLElement;
    const target = host.querySelector('.resistor-controls select') as HTMLSelectElement | null;
    target?.focus();
  }

  private clearApplyFeedbackTimer(): void {
    if (this.applyFeedbackTimer !== null) {
      clearTimeout(this.applyFeedbackTimer);
      this.applyFeedbackTimer = null;
    }
  }

  private clearShareLinkFeedbackTimer(): void {
    if (this.shareLinkFeedbackTimer !== null) {
      clearTimeout(this.shareLinkFeedbackTimer);
      this.shareLinkFeedbackTimer = null;
    }
  }

  private clearUrlSyncTimer(): void {
    if (this.urlSyncTimer !== null) {
      clearTimeout(this.urlSyncTimer);
      this.urlSyncTimer = null;
    }
  }

  private scheduleUrlSync(nextManagedParams: ResistorUrlQueryParamMap, fingerprint: string): void {
    this.clearUrlSyncTimer();
    this.urlSyncTimer = setTimeout(() => {
      const currentQueryParams = this.getCurrentQueryParams();
      const currentManagedParams = toQueryParams(fromQueryParams(currentQueryParams));

      if (this.areManagedQueryParamsEqual(nextManagedParams, currentManagedParams)) {
        this.lastScheduledUrlSyncFingerprint = null;
        return;
      }

      const unmanagedParams = this.getUnmanagedQueryParams(currentQueryParams);
      const mergedQueryParams = {
        ...unmanagedParams,
        ...nextManagedParams,
      };

      void this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: mergedQueryParams,
          replaceUrl: true,
        })
        .finally(() => {
          if (this.lastScheduledUrlSyncFingerprint === fingerprint) {
            this.lastScheduledUrlSyncFingerprint = null;
          }
        });
    }, URL_SYNC_DEBOUNCE_MS);
  }

  private setupUrlSyncEffect(): void {
    effect(() => {
      if (!this.isUrlSyncReady()) {
        return;
      }

      this.forwardFormSyncValue();
      this.reverseFormSyncValue();

      const nextManagedParams = toQueryParams(this.toUrlState());
      const currentQueryParams = this.getCurrentQueryParams();
      const currentManagedParams = toQueryParams(fromQueryParams(currentQueryParams));

      if (!this.hasInitializedUrlSync) {
        this.hasInitializedUrlSync = true;
        return;
      }

      if (this.areManagedQueryParamsEqual(nextManagedParams, currentManagedParams)) {
        this.lastScheduledUrlSyncFingerprint = null;
        this.clearUrlSyncTimer();
        return;
      }

      const fingerprint = this.toManagedFingerprint(nextManagedParams);
      if (fingerprint === this.lastScheduledUrlSyncFingerprint) {
        return;
      }

      this.lastScheduledUrlSyncFingerprint = fingerprint;
      this.scheduleUrlSync(nextManagedParams, fingerprint);
    });
  }

  private toUrlState(): ResistorUrlState {
    const forwardValue = this.form.getRawValue();
    const reverseValue = this.reverseForm.getRawValue();

    return {
      mode: this.mode(),
      forward: {
        bandCount: this.toUrlBandCountValue(forwardValue.bandCount),
        digit1: forwardValue.digit1,
        digit2: forwardValue.digit2,
        digit3: forwardValue.digit3,
        multiplier: forwardValue.multiplier,
        tolerance: forwardValue.tolerance,
        tcr: forwardValue.tcr,
      },
      reverse: {
        targetInput: reverseValue.targetInput,
        bandCount: this.toUrlBandCountValue(reverseValue.bandCount),
        tolerancePct:
          reverseValue.tolerancePct !== null ? String(reverseValue.tolerancePct) : undefined,
        tcrPpm: reverseValue.tcrPpm !== null ? String(reverseValue.tcrPpm) : undefined,
        mode: reverseValue.mode,
      },
    };
  }

  private buildShareUrl(): string {
    const currentQueryParams = this.getCurrentQueryParams();
    const unmanagedParams = this.getUnmanagedQueryParams(currentQueryParams);
    const managedParams = toQueryParams(this.toUrlState());

    const urlTree = this.router.createUrlTree([], {
      relativeTo: this.route,
      queryParams: {
        ...unmanagedParams,
        ...managedParams,
      },
    });

    const serializedUrl = this.router.serializeUrl(urlTree);
    const origin = globalThis.location?.origin;

    return origin ? `${origin}${serializedUrl}` : serializedUrl;
  }

  private toUrlBandCountValue(value: 4 | 5 | 6): UrlBandCountValue {
    return String(value) as UrlBandCountValue;
  }

  private areManagedQueryParamsEqual(
    left: ResistorUrlQueryParamMap,
    right: ResistorUrlQueryParamMap,
  ): boolean {
    return URL_STATE_PARAM_ORDER.every((key) => left[key] === right[key]);
  }

  private toManagedFingerprint(params: ResistorUrlQueryParamMap): string {
    return URL_STATE_PARAM_ORDER.map((key) => `${key}:${params[key] ?? ''}`).join('|');
  }

  private getCurrentQueryParams(): Record<string, string | string[] | null | undefined> {
    return this.route.snapshot.queryParams as Record<string, string | string[] | null | undefined>;
  }

  private getUnmanagedQueryParams(
    queryParams: Record<string, string | string[] | null | undefined>,
  ): Record<string, string | string[] | null | undefined> {
    const unmanaged: Record<string, string | string[] | null | undefined> = {};

    for (const [key, value] of Object.entries(queryParams)) {
      if (!URL_STATE_PARAM_ORDER.includes(key as (typeof URL_STATE_PARAM_ORDER)[number])) {
        unmanaged[key] = value;
      }
    }

    return unmanaged;
  }
}
