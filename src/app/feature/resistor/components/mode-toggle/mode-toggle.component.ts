import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface ModeOption {
  key: string;
  label: string;
}

@Component({
  selector: 'app-mode-toggle',
  templateUrl: './mode-toggle.component.html',
  styleUrl: './mode-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeToggleComponent {
  public readonly modes = input.required<readonly ModeOption[]>();
  public readonly activeMode = input.required<string>();
  public readonly modeChange = output<string>();
}
