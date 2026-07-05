import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ResistorReferenceService } from '@resistor/services/resistor-reference.service';

@Component({
  selector: 'app-reference-panel',
  templateUrl: './reference-panel.component.html',
  styleUrl: './reference-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferencePanelComponent {
  private readonly referenceService = inject(ResistorReferenceService);

  public readonly reference = this.referenceService.reference;
}
