import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import * as moment from 'moment';
import {first} from 'rxjs';
import {Notification} from 'src/app/core/interfaces/notification.interface';
import {CalendarAccessService} from 'src/app/core/services/calendar/access.service';
import {CommonService} from 'src/app/core/services/common.service';
import {NotificationService} from 'src/app/core/services/notification/notification.service';
import {BroadcasterService} from "../../../../shared/services";

@Component({
  selector: 'app-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.scss']
})
export class NotificationItemComponent implements OnInit {

  @Output() notificationViewedEvent = new EventEmitter<void>();
  @Input("notification")
  notification!: Notification;
  error: any | null = null;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly calendarAccessService: CalendarAccessService,
    private readonly commonService: CommonService,
    private broadcaster: BroadcasterService
  ) {
  }

  ngOnInit(): void {
  }

  getSenderName(notification: Notification): string {
    return notification.sender.firstName + " " + notification.sender.lastName;
  }

  getNotificationMessage(notification: Notification): string {
    if (notification.type == 'access_request') {
      const timeForAccess = notification.accessRequest?.timeForAccess
      let message = 'requested access to your calendar';

      if (timeForAccess != null) {
        const requestStatus = notification.accessRequest?.status
        message = `${message} until ${this.commonService.getFormattedDateString(moment(timeForAccess), 'YYYY-MM-DD')}${requestStatus === 'pending' ? '' : ` - ${requestStatus}`}`;
      }

      return `${message}.`;

    } else if (notification.type == 'calendar_shared') return 'shared their calendar with you.';
    else if (notification.type == 'request_approved') return 'approved your request.';
    else if (notification.type == 'request_denied') return 'denied your request.';
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
          this.markAsRead(notification);
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  approveRequest(notification: Notification) {
    this.calendarAccessService.approveAccessRequest(notification.accessRequest?.id ?? 'undefined')
      .pipe(first())
      .subscribe({
        next: () => {
          this.markAsRead(notification);
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  markAsRead(notification: Notification) {
    this.notificationService.markAsViewed(notification.id)
      .pipe(first())
      .subscribe({
        next: () => {
          this.notification.viewed = true;
          this.broadcaster.broadcast('notification_count_update', true);
        },
        error: (error) => {
          this.error = error;
        }
      });
  }
}
