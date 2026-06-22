import { Pipe, PipeTransform } from '@angular/core';

import { formatVolts } from '@shared/utils/format-value.util';

@Pipe({
  name: 'volts',
})
export class VoltsPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatVolts(value ?? 0);
  }
}
