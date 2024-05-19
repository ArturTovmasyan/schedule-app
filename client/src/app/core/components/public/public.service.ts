import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, of, throwError } from 'rxjs';
import { ApiResponse } from '../../interfaces/response/api.response.interface';

@Injectable()
export class PublicCalendarService {

  calendarData$: BehaviorSubject<any> = new BehaviorSubject({});
  calendarData$$ = this.calendarData$.asObservable();
  calendarData: any;
  constructor(
    private readonly http: HttpClient
    ) {
      console.log('test');
    }

    getDetails(id: string) {
        return this.http.get<ApiResponse<any>>(`/api/sharable-links/${id}`)
          .pipe(
            map((res: any) => {
              this.calendarData = res.data;
              this.calendarData$.next(res.data)
              return res;
            }),
            catchError((error) => {
              return throwError(() => new Error(error));
            })
          );
    }

}
