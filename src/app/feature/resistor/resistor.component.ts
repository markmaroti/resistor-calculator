import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';

import { ResettableTimer } from '@shared/utils/resettable-timer.util';

import { ResistorClipboardService } from '@resistor/services/resistor-clipboard.service';
import { ResistorStore } from '@resistor/state/resistor.store';
import {
  toResistorUrlState,
  type CalculatorMode,
} from '@resistor/state/resistor-url-state.mappers';
import {
  ModeOption,
  ModeToggleComponent,
} from '@resistor/components/mode-toggle/mode-toggle.component';
import { ForwardFormComponent } from '@resistor/components/forward-form/forward-form.component';
import { ResultCardComponent } from '@resistor/components/result-card/result-card.component';
import { HelpSectionComponent } from '@resistor/components/help-section/help-section.component';
import { ReverseShellComponent } from '@resistor/components/reverse-shell/reverse-shell.component';
import { ResistorUrlStateService } from '@resistor/services/resistor-url-state.service';

import {
  Color,
  DIGIT_BY_COLOR,
  MULTIPLIER_BY_COLOR,
  TCR_BY_COLOR,
  TOLERANCE_BY_COLOR,
  BAND_COUNTS,
  ReverseMode,
  ReverseCandidate,
} from './resistor.model';

@Component({
  selector: 'app-resistor',
  templateUrl: './resistor.component.html',
  styleUrl: './resistor.component.scss',
  imports: [
    ModeToggleComponent,
    ForwardFormComponent,
    ResultCardComponent,
    HelpSectionComponent,
    ReverseShellComponent,
  ],
  providers: [ResistorStore, ResistorUrlStateService, ResistorClipboardService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResistorComponent implements OnDestroy {
  private readonly store = inject(ResistorStore);
  private readonly clipboardService = inject(ResistorClipboardService);
  private readonly urlStateService = inject(ResistorUrlStateService);
  private readonly applyFeedbackTimer = new ResettableTimer();
  private readonly focusTimer = new ResettableTimer();

  private readonly forwardFormSyncValue = this.store.form().value;

  private readonly reverseFormSyncValue = this.store.reverseForm().value;

  private readonly isUrlSyncReady = signal(false);

  public readonly form = this.store.form;
  public readonly viewModel = this.store.viewModel;
  public readonly validationMessage = this.store.validationMessage;
  public readonly reverseForm = this.store.reverseForm;
  public readonly reverseViewModel = this.store.reverseViewModel;
  public readonly reverseValidationMessage = this.store.reverseValidationMessage;
  public readonly isAtDefaults = this.store.isAtDefaults;

  public readonly showHelp = signal(false);
  public readonly copyState = this.clipboardService.resultCopyState;
  public readonly shareLinkCopyState = this.clipboardService.shareLinkCopyState;
  public readonly applyFeedback = signal('');
  public readonly mode = signal<CalculatorMode>('forward');

  public readonly calculatorModes: ReadonlyArray<ModeOption<CalculatorMode>> = [
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

  public constructor() {
    const mode = this.urlStateService.hydrateStoreFromUrlState();
    if (mode !== undefined) {
      this.mode.set(mode);
    }

    this.urlStateService.setupUrlSync({
      isReady: this.isUrlSyncReady,
      forwardFormSyncValue: this.forwardFormSyncValue,
      reverseFormSyncValue: this.reverseFormSyncValue,
      getUrlState: () => this.currentUrlState(),
    });
    this.isUrlSyncReady.set(true);
  }

  public ngOnDestroy(): void {
    this.applyFeedbackTimer.clear();
    this.focusTimer.clear();
  }

  public toggleHelp() {
    this.showHelp.update((value) => !value);
  }

  public setMode(mode: CalculatorMode): void {
    this.mode.set(mode);
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
    this.applyFeedbackTimer.schedule(() => this.applyFeedback.set(''), 1500);
    this.focusTimer.schedule(() => this.focusForwardPrimaryControl(), 0);
  }

  public async copyResult(): Promise<void> {
    if (!this.isCopyEnabled()) {
      return;
    }

    const vm = this.viewModel();
    await this.clipboardService.copyResistanceResult({
      ohms: vm.ohms,
      tolerancePct: vm.tolerancePct,
      tcrPpm: vm.tcrPpm,
    });
  }

  public async copyShareLink(): Promise<void> {
    await this.clipboardService.copyShareLink(
      this.urlStateService.buildShareUrl(this.currentUrlState()),
    );
  }

  private focusForwardPrimaryControl(): void {
    this.form.bandCount().focusBoundControl();
  }

  private currentUrlState() {
    return toResistorUrlState(this.mode(), this.form().value(), this.reverseForm().value());
  }
}
