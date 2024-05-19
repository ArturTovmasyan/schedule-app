import {Component, OnDestroy} from '@angular/core';
import * as moment from 'moment';
import {Moment} from 'moment';
import {Subscription, first} from 'rxjs';
import {AccessRequest} from 'src/app/core/interfaces/calendar/access-request.interface';
import {CalendarAccessService} from 'src/app/core/services/calendar/access.service';
import {CommonService} from 'src/app/core/services/common.service';
import {BroadcasterService} from "../../../../shared/services";
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-share-calendar',
  templateUrl: './share-calendar.component.html',
  styleUrls: ['./share-calendar.component.scss']
})
export class ShareCalendarComponent implements OnDestroy {

  subscription$!: Subscription;
  emails: string[] = [];
  currentDurationIndex = 2;
  endDate: Moment | null = null;
  message = '';
  requestCalendarAccess = true;
  error: any | null = null;
  fullName = '';

  constructor(
    private readonly accessService: CalendarAccessService,
    private readonly broadcaster: BroadcasterService,
    private readonly commonService: CommonService,
    private readonly authService: AuthService
  ) { }
 

  ngOnInit() {
    this.subscription$ = this.authService.currentUser.subscribe({
      next: (res: any) => {
        this.fullName = res?.user?.fullName ?? '';
        this.message = `Hey all,\n\nPlease share your calendars with me so I can schedule with ease. \n\n ${this.fullName}`;
      }
    });
  }

  updateEmails(emails: string[]) {
    this.emails = emails;
  }

  onMessageUpdate(event: Event) {
    this.message = (event.target as any).value;
  }

  onCustomDateUpdate(event: Event) {
    const value = (event.target as any).value;
    this.endDate = moment(value, 'YYYY-MM-DD').add(1, 'day');
  }

  onDurationSelectionChanged(index: number) {
    this.currentDurationIndex = index;
    switch (index) {
      case 0:
        this.endDate = moment(new Date()).add(3, 'weeks');
        break;
      case 1:
        this.endDate = moment(new Date()).add(1, 'month');
        break;
      default:
        this.endDate = null
        break;
    }
  }

  onRequestStatusUpdate(event: Event) {
    this.requestCalendarAccess = (event.target as any).checked ?? false;
  }

  submitRequest() {
    this.accessService.shareCalendarAccess({
      toEmails: this.emails,
      comment: this.message,
      timeForAccess: this.commonService.getFormattedDateString(this.endDate)
    }).pipe(first())
      .subscribe({
        next: (data: AccessRequest) => {
          if(this.requestCalendarAccess) {
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
    this.accessService.requestCalendarAccess(data)
      .pipe(first())
      .subscribe({
        error: (error) => {
          this.error = error;
        }
      });
  }

  close() {
    this.broadcaster.broadcast('calendar_full_size', true);
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }

}
