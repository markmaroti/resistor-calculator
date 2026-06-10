import { Pipe, PipeTransform } from '@angular/core';
import { formatOhms } from '../utils/format-value.util';

@Pipe({
  name: 'ohms',
})
export class OhmsPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatOhms(value ?? 0);
  }
}
