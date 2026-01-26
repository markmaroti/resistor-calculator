import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-select',
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent<T> {
  readonly label = input.required<string>();
  readonly options = input.required<readonly T[]>();
  readonly value = input.required<T>();

  readonly valueChange = output<T>();

  public onChange(selectedIndex: string) {
    const index = Number(selectedIndex);
    const option = this.options()[index];
    if (option !== undefined) {
      this.valueChange.emit(option);
    }
  }
}
