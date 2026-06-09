import { Pipe, PipeTransform } from '@angular/core';
import { formatAmps } from '../utils/format-value.util';

@Pipe({
  name: 'amps',
})
export class AmpsPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    return formatAmps(value ?? 0);
  }
}
