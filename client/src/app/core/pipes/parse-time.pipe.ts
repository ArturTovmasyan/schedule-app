import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'parseTime'
})
export class ParseTimePipe implements PipeTransform {

  transform(date: string | null, format = 'YYYY-MM-DDTHH:mm:ss.sssZ'): string | null {
    if (date) {
      return moment.utc(date).local().format(format);
    } else {
      return null;
    }
  }

}
