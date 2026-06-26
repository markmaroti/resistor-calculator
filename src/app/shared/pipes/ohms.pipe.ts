import { Pipe, PipeTransform } from '@angular/core';

import { formatOhms } from '@shared/utils/format-value.util';

@Pipe({
  name: 'ohms',
})
export class OhmsPipe implements PipeTransform {
  public transform(value: number | null | undefined): string {
    return formatOhms(value ?? 0);
  }
}
