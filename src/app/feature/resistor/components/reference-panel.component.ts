import { ChangeDetectionStrategy, Component } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Color } from '../resistor.model';

type ResistorReference = {
  eSeries: { name: string; values: number[] }[];
  tolerances: { color: Color; pct: number }[];
  tcr: { color: Color; ppm: number }[];
};

@Component({
  selector: 'app-reference-panel',
  templateUrl: './reference-panel.component.html',
  styleUrl: './reference-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferencePanelComponent {
  public readonly reference = httpResource<ResistorReference>(() => '/resistor-reference.json', {
    defaultValue: {
      eSeries: [],
      tolerances: [],
      tcr: [],
    },
  });
}
