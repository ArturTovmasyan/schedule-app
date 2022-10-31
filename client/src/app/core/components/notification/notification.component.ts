import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
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
    this.notificationService.fetchPendingNotifications()
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
}

interface NotificationData {
  notifications: { [key: string]: Notification[] }
  total: number;
}
