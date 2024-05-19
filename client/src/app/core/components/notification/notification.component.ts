import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { first } from 'rxjs';
import { Notification } from '../../interfaces/notification.interface';
import { CalendarAccessService } from '../../services/calendar/access.service';
import { CommonService } from '../../services/common.service';
import { NotificationService } from '../../services/notification/notification.service';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit {

  data: NotificationData = {
    total: 0,
    notifications: {}
  };
  error: any;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly calendarAccessService: CalendarAccessService,
    private readonly commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }
  
  fetchNotifications() {
    this.notificationService.fetch()
    .pipe(first())
      .subscribe({
        next: ([array, total]: [Notification[] | null, number]) => {
          this.data.total = total;
          this.data.notifications = {};
          array?.forEach((notification) => {
            const [elapsedTime, unit] = this.commonService.getElapsedTime(notification.createdOn);
            const key = `${elapsedTime} ${unit}`;
            if(this.data.notifications[key] == null) {
              this.data.notifications[key] = []
            }
            this.data.notifications[key].push(notification);
          })
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  getSenderName(notification: Notification): string {
    return notification.sender.firstName + " " + notification.sender.lastName;
  }

  getNotificationMessage(notification: Notification): string {
    if(notification.type == 'access_request') {
      const timeForAccess = notification.accessRequest?.timeForAccess
      let message = 'requested access to your calendar';
      if(timeForAccess != null) {
        const requestStatus = notification.accessRequest?.status
        message = `${message} until ${this.commonService.getFormattedDateString(moment(timeForAccess), 'YYYY-MM-DD')} - ${requestStatus === 'pending' ? '' : requestStatus }`;
      }
      return `${message}.`;
    } else if(notification.type == 'calendar_shared') return 'shared their calendar with you.';
    else if(notification.type == 'request_approved') return 'approved your request.';
    else if(notification.type == 'request_denied') return 'denied your request.';
    else return 'N/A'
  }

  hasActions(notification: Notification): boolean {
    const validTypes = ["access_request"];
    return validTypes.includes(notification.type) && notification.accessRequest?.status == 'pending';
  }

  denyRequest(notification: Notification) {
    this.calendarAccessService.denyAccessRequest(notification.accessRequest?.id ?? 'undefined')
    .pipe(first())
      .subscribe({
        next: () => {
          this.fetchNotifications();
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  approveRequest(notification: Notification) {
    this.calendarAccessService.denyAccessRequest(notification.accessRequest?.id ?? 'undefined')
    .pipe(first())
      .subscribe({
        next: () => {
          this.fetchNotifications();
        },
        error: (error) => {
          this.error = error;
        }
      });
  }
}

interface NotificationData {
  notifications: { [key: string]: Notification[] }
  total: number;
}
