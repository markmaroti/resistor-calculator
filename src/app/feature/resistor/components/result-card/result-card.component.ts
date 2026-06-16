import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { OhmsPipe } from '../../../../shared/pipes/ohms.pipe';

export type CopyState = 'idle' | 'success' | 'error';

@Component({
  selector: 'app-result-card',
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.scss',
  imports: [OhmsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResultCardComponent {
  public readonly ohms = input.required<number>();
  public readonly tolerancePct = input<number | null>(null);
  public readonly tcrPpm = input<number | null>(null);
  public readonly copyState = input<CopyState>('idle');
  public readonly isCopyEnabled = input<boolean>(false);
  public readonly validationMessage = input<string>('');

  public readonly copyResult = output();
}
