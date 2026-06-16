import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ReverseCandidate, ReverseErrorCode } from '../../resistor.model';
import { ReverseViewModel } from '../../state/resistor.mappers';
import { SelectComponent } from '../../../../shared/select/select.component';
import { OhmsPipe } from '../../../../shared/pipes/ohms.pipe';

@Component({
  selector: 'app-reverse-shell',
  templateUrl: './reverse-shell.component.html',
  styleUrl: './reverse-shell.component.scss',
  imports: [ReactiveFormsModule, SelectComponent, OhmsPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReverseShellComponent {
  public readonly reverseForm = input.required<FormGroup>();
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
