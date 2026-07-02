import { Injectable, OnDestroy, signal } from '@angular/core';

import { copyTextToClipboard } from '@shared/utils/clipboard.util';

import { buildResistanceCopyText } from '@resistor/utils/resistance-copy-text.util';

const COPY_STATE_RESET_MS = 1500;

export type ClipboardCopyState = 'idle' | 'success' | 'error';

export type ResistanceCopyInput = {
  ohms: number;
  tolerancePct: number | null;
  tcrPpm: number | null;
};

@Injectable()
export class ResistorClipboardService implements OnDestroy {
  private resultCopyTimer: ReturnType<typeof setTimeout> | null = null;
  private shareLinkCopyTimer: ReturnType<typeof setTimeout> | null = null;

  public readonly resultCopyState = signal<ClipboardCopyState>('idle');
  public readonly shareLinkCopyState = signal<ClipboardCopyState>('idle');

  public ngOnDestroy(): void {
    this.clearResultCopyTimer();
    this.clearShareLinkCopyTimer();
  }

  public async copyResistanceResult(input: ResistanceCopyInput): Promise<void> {
    const copied = await copyTextToClipboard(buildResistanceCopyText(input));
    this.resultCopyState.set(copied ? 'success' : 'error');
    this.clearResultCopyTimer();
    this.resultCopyTimer = setTimeout(() => this.resultCopyState.set('idle'), COPY_STATE_RESET_MS);
  }

  public async copyShareLink(url: string): Promise<void> {
    const copied = await copyTextToClipboard(url);
    this.shareLinkCopyState.set(copied ? 'success' : 'error');
    this.clearShareLinkCopyTimer();
    this.shareLinkCopyTimer = setTimeout(
      () => this.shareLinkCopyState.set('idle'),
      COPY_STATE_RESET_MS,
    );
  }

  private clearResultCopyTimer(): void {
    if (this.resultCopyTimer !== null) {
      clearTimeout(this.resultCopyTimer);
      this.resultCopyTimer = null;
    }
  }

  private clearShareLinkCopyTimer(): void {
    if (this.shareLinkCopyTimer !== null) {
      clearTimeout(this.shareLinkCopyTimer);
      this.shareLinkCopyTimer = null;
    }
  }
}
