import {Injectable} from '@angular/core';
import * as moment from 'moment-timezone';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  getFormattedDateString(date: moment.Moment | null, format = `YYYY-MM-DDTHH:mm:ss.sssZ`): string | null {
    if (date != null) {
      return date.format(format);
    }
    return null
  }

  get localTimezone(): string {
    return moment.tz.guess();
  }

  get formattedLocalTimezone(): string {
    let offset = moment.tz(this.localTimezone).format('Z');
    offset = offset.replace(":00", "");
    return `UTC${offset} / ${moment.tz(this.localTimezone).format('zz')}`
  }

  getElapsedTime(dateString: string): [number, string] {
    const date = moment(dateString, 'YYYY-MM-DDTHH:mm:ss.sssZ').tz(moment.tz.guess());
    const mins = moment().utc().diff(date, 'minutes');

    if (mins > 60) {
      const hours = moment().diff(date, 'hours');
      if (hours >= 24) {
        const days = moment().diff(date, 'days');
        return [days, 'days'];
      }
      return [hours, 'hours'];
    }
    return [mins, 'mins'];
  }
}
