import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

export interface ModeOption<T extends string = string> {
  key: T;
  label: string;
}

@Component({
  selector: 'app-mode-toggle',
  templateUrl: './mode-toggle.component.html',
  styleUrl: './mode-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModeToggleComponent<T extends string> {
  public readonly modes = input.required<readonly ModeOption<T>[]>();
  public readonly activeMode = input.required<T>();
  public readonly modeChange = output<T>();
}
