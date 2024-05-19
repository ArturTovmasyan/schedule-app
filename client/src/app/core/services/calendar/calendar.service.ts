import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {ApiResponse} from '../../interfaces/response/api.response.interface';
import {DatePipe} from "@angular/common";
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CalendarService {

  constructor(
    private readonly http: HttpClient,
    private datePipe: DatePipe
  ) {
  }

  get url(): string {
    return '/api/calendar/events';
  }

  fetchEvents() {
    let initDate = moment().subtract(1, 'month').toDate();
    let startDate = this.datePipe.transform(initDate, 'yyyy-MM-dd');
    let endDate = moment(startDate, "yyyy-MM-DD").add(2, 'month').format('yyyy-MM-DD');

    return this.http.get<ApiResponse<any>>(this.url + '?startDate='+startDate+'&dateEnd='+endDate, {}).pipe(
      map((response: ApiResponse<any>) => {
        return response;
      })
    )
  }

  fetchContactEvents(contactId: string) {
    let initDate = moment().subtract(1, 'week').toDate(); //TODO add event for contact and test
    let startDate = this.datePipe.transform(initDate, 'yyyy-MM-dd');
    let endDate = moment(startDate, "yyyy-MM-DD").add(1, 'month').format('yyyy-MM-DD');

    return this.http.get<ApiResponse<any>>(this.url+'/'+contactId+'?startDate='+startDate+'&dateEnd='+endDate, {}).pipe(
      map((response: ApiResponse<any>) => {
        return response;
      })
    )
  }
}
