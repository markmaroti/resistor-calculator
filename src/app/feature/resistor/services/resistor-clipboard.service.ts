import { Injectable, OnDestroy, signal } from '@angular/core';

import { ClipboardCopyState, copyTextToClipboard } from '@shared/utils/clipboard.util';
import { ResettableTimer } from '@shared/utils/resettable-timer.util';

import { buildResistanceCopyText } from '@resistor/utils/resistance-copy-text.util';
import { ResistanceData } from '@resistor/resistor.model';

const COPY_STATE_RESET_MS = 1500;

class TransientCopyState {
  private readonly resetTimer = new ResettableTimer();

  public readonly state = signal<ClipboardCopyState>(ClipboardCopyState.Idle);

  public trigger(copied: boolean): void {
    this.state.set(copied ? ClipboardCopyState.Success : ClipboardCopyState.Error);
    this.resetTimer.schedule(() => this.state.set(ClipboardCopyState.Idle), COPY_STATE_RESET_MS);
  }

  public clearTimer(): void {
    this.resetTimer.clear();
  }
}

@Injectable()
export class ResistorClipboardService implements OnDestroy {
  private readonly resultCopy = new TransientCopyState();
  private readonly shareLinkCopy = new TransientCopyState();

  public readonly resultCopyState = this.resultCopy.state;
  public readonly shareLinkCopyState = this.shareLinkCopy.state;

  public ngOnDestroy(): void {
    this.resultCopy.clearTimer();
    this.shareLinkCopy.clearTimer();
  }

  public async copyResistanceResult(input: ResistanceData): Promise<void> {
    const copied = await copyTextToClipboard(buildResistanceCopyText(input));
    this.resultCopy.trigger(copied);
  }

  public async copyShareLink(url: string): Promise<void> {
    const copied = await copyTextToClipboard(url);
    this.shareLinkCopy.trigger(copied);
  }
}
