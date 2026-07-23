import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent<T> implements FormValueControl<T> {
  public readonly label = input.required<string>();
  public readonly options = input.required<readonly T[]>();

  public readonly value = model.required<T>();

  public readonly disabled = input<boolean>(false);
  public readonly touch = output<void>();

  public onChange(selectedIndex: string): void {
    const index = Number(selectedIndex);
    const option = this.options()[index];
    if (option !== undefined) {
      this.value.set(option);
    }
  }

  public onTouched(): void {
    this.touch.emit();
  }
}
