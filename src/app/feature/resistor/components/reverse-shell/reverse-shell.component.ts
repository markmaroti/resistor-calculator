import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';

import { SelectComponent } from '@shared/select/select.component';
import { OhmsPipe } from '@shared/pipes/ohms.pipe';

import { ReverseCandidate, ReverseErrorCode, ReverseFormValue } from '@resistor/resistor.model';
import { ReverseViewModel } from '@resistor/state/resistor.mappers';

@Component({
  selector: 'app-reverse-shell',
  templateUrl: './reverse-shell.component.html',
  styleUrl: './reverse-shell.component.scss',
  imports: [FormField, SelectComponent, OhmsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReverseShellComponent {
  public readonly reverseForm = input.required<FieldTree<ReverseFormValue>>();
  public readonly reverseViewModel = input.required<ReverseViewModel>();
  public readonly reverseValidationMessage = input<string>('');
  public readonly bandCounts = input.required<readonly number[]>();
  public readonly reverseModes = input.required<readonly string[]>();

  public readonly applyCandidate = output<ReverseCandidate>();

  public readonly hasReverseError = computed(() => {
    const vm = this.reverseViewModel();
    return vm.parseErrorCode !== null || vm.serviceErrorCode === ReverseErrorCode.InvalidTargetOhms;
  });

  public readonly hasReverseNoCandidates = computed(
    () => this.reverseViewModel().serviceErrorCode === ReverseErrorCode.NoCandidates,
  );
}
