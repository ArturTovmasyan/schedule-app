import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'acronymName'
})
export class AcronymNamePipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): unknown {
    return value.split(' ').map(n => n[0]).join('');
  }
}
