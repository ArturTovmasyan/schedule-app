import { Injectable } from '@angular/core';
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
}
