import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-resistor-guide',
  templateUrl: './resistor-guide.component.html',
  styleUrl: './resistor-guide.component.scss',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResistorGuideComponent {}
