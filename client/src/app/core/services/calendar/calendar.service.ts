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
    let currentDate = new Date();
    let startDate = this.datePipe.transform(currentDate, 'yyyy-MM-dd');
    let endDate = moment(currentDate, "yyyy-MM-DD").add(7, 'days').format('yyyy-MM-DD');
    return this.http.get<ApiResponse<any>>(this.url + '?startDate='+startDate+'&dateEnd='+endDate, {}).pipe(
      map((response: ApiResponse<any>) => {
        return response;
      })
    )
  }
}
