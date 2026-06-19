import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReferencePanelComponent } from '@resistor/components/reference-panel/reference-panel.component';

@Component({
  selector: 'app-help-section',
  templateUrl: './help-section.component.html',
  styleUrl: './help-section.component.scss',
  imports: [RouterLink, ReferencePanelComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpSectionComponent {
  public readonly showHelp = input<boolean>(false);
  public readonly isAtDefaults = input<boolean>(true);

  public readonly toggleHelp = output();
  public readonly resetToDefaults = output();
}
