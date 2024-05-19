import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { first } from 'rxjs';
import { AccessRequest } from 'src/app/core/interfaces/calendar/access-request.interface';
import { CalendarAccessService } from 'src/app/core/services/calendar/access.service';

@Component({
  selector: 'app-access-request',
  templateUrl: './access-request.component.html',
  styleUrls: ['./access-request.component.scss']
})
export class AccessRequestComponent {

  emails: string[] = [];
  currentDurationIndex = 2;
  endDate: Date | null = null;
  message = 'asdasdasd';
  shareCalendarAccess = true;
  error: any | null = null;

  constructor(private accessService: CalendarAccessService) { }

  updateEmails(emails: string[]) {
    this.emails = emails;
    console.log(this.emails)
  }

  onMessageUpdate(event: Event) {
    const value = (event.target as any).value;
    this.message = value;
  }

  onCustomDateUpdate(event: Event) {
    const value = (event.target as any).value;
    this.endDate = moment(value, 'YYYY-MM-DD').add(1, 'day').toDate();
  }

  onDurationSelectionChanged(index: number) {
    this.currentDurationIndex = index;
    switch (index) {
      case 0:
        this.endDate = moment(new Date()).add(2, 'weeks').toDate();
        break;
      case 1:
        this.endDate = moment(new Date()).add(1, 'month').toDate();
        break;
      default:
        this.endDate = null
        break;
    }
  }

  onShareStatusUpdate(event: Event) {
    this.shareCalendarAccess = (event.target as any).checked ?? false;
  }

  submitRequest() {
    this.accessService.requestCalendarAccess({
      toEmail: this.emails,
      comment: this.message,
      timeForAccess: this.endDate?.toDateString() ?? null
    }).pipe(first())
      .subscribe({
        next: (data: AccessRequest) => {
          if(this.shareCalendarAccess) {
            this.shareCalendar(data);
          }
          this.message = '';
          this.endDate = null;
          this.emails = [];
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  shareCalendar(data: AccessRequest) {
    this.accessService.shareCalendarAccess(data)
      .pipe(first())
      .subscribe({
        error: (error) => {
          this.error = error;
        }
      });
  }
}
