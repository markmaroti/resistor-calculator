import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
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
import { ResistorStore } from './state/resistor.store';
import { copyTextToClipboard } from '../../shared/utils/clipboard.util';
import { buildResistanceCopyText } from './utils/resistance-copy-text.util';
import { ModeToggleComponent } from './components/mode-toggle/mode-toggle.component';
import { ForwardFormComponent } from './components/forward-form/forward-form.component';
import { ResultCardComponent, CopyState } from './components/result-card/result-card.component';
import { HelpSectionComponent } from './components/help-section/help-section.component';
import { ReverseShellComponent } from './components/reverse-shell/reverse-shell.component';

type CalculatorMode = 'forward' | 'reverse';

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
  private readonly store = inject(ResistorStore);
  private readonly hostElement = inject(ElementRef<HTMLElement>);
  private applyFeedbackTimer: ReturnType<typeof setTimeout> | null = null;

  public readonly form = this.store.form;
  public readonly viewModel = this.store.viewModel;
  public readonly validationMessage = this.store.validationMessage;
  public readonly reverseForm = this.store.reverseForm;
  public readonly reverseViewModel = this.store.reverseViewModel;
  public readonly reverseValidationMessage = this.store.reverseValidationMessage;
  public readonly isAtDefaults = this.store.isAtDefaults;

  public readonly showHelp = signal(false);
  public readonly copyState = signal<CopyState>('idle');
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

  public ngOnDestroy(): void {
    this.clearApplyFeedbackTimer();
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
}
