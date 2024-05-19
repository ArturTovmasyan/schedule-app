import { Component, OnInit } from '@angular/core';
import { first } from 'rxjs';
import { Notification } from '../../interfaces/notification.interface';
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
    private readonly commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.fetchNotifications();
  }
  
  fetchNotifications() {
    this.notificationService.fetch()
    .pipe(first())
      .subscribe({
        next: (data: Notification[] | null) => {
          data?.forEach((notification) => {
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

  getNotificationMessage(type: string): string {
    if(type == 'access_request') return 'requested access to your calendar.';
    else if(type == 'calendar_shared') return 'shared their calendar with you.';
    else if(type == 'request_approved') return 'approved your request.';
    else if(type == 'request_denied') return 'denied your request.';
    else return 'N/A'
  }

  hasActions(type: string): boolean {
    const validTypes = ["access_request"];
    return validTypes.includes(type);
  }
}

interface NotificationData {
  notifications: { [key: string]: Notification[] }
  total: number;
}
