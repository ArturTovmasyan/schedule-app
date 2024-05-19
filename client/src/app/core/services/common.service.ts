import { Injectable } from '@angular/core';
import * as moment from 'moment';
import { Moment } from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor() {}

  getFormattedDateString(date: Moment | null): string | null {
    if(date != null) {
      return date.utc().format(`YYYY-MM-DDTHH:mm:ss.sssZ`);
    }
    return null
  }

  getElapsedTime(dateString: string): [number, string] {
    const date = moment(dateString, 'YYYY-MM-DDTHH:mm:ss.sssZ');
    const seconds = moment().diff(date, 'seconds');
    if(seconds > 60) {
      const mins = moment().diff(date, 'minutes');
      if(mins > 60) {
        const hours = moment().diff(date, 'hours');
        if(hours >= 24) {
          const days = moment().diff(date, 'days');
          return [days, 'days'];
        }
        return [hours, 'hours'];
      }
      return [mins, 'mins'];
    }
    return [seconds, 'secs'];
  }
}
