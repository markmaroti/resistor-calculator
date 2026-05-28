import { Pipe, PipeTransform } from '@angular/core';
import { formatOhms } from '../utils/ohms-format.util';

@Pipe({
  name: 'ohms',
})
export class OhmsPipe implements PipeTransform {
  transform(value: number): string {
    return formatOhms(value);
  }
}
