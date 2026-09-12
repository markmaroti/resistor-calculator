import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { OhmsPipe } from '@shared/pipes/ohms.pipe';
import { ClipboardCopyState } from '@shared/utils/clipboard.util';

@Component({
  selector: 'app-result-card',
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.scss',
  imports: [OhmsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultCardComponent {
  protected readonly ClipboardCopyState = ClipboardCopyState;

  public readonly ohms = input.required<number>();
  public readonly tolerancePct = input<number | null>(null);
  public readonly tcrPpm = input<number | null>(null);
  public readonly copyState = input<ClipboardCopyState>(ClipboardCopyState.Idle);
  public readonly isCopyEnabled = input<boolean>(false);
  public readonly validationMessage = input<string>('');

  public readonly copyResult = output();
}
