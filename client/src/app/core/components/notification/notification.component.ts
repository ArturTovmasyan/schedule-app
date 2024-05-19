import {Component, OnDestroy, OnInit} from '@angular/core';
import {BehaviorSubject, first} from 'rxjs';
import {Notification} from '../../interfaces/notification.interface';
import {CommonService} from '../../services/common.service';
import {NotificationService} from '../../services/notification/notification.service';
import {BroadcasterService} from "../../../shared/services";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit, OnDestroy {

  data: NotificationData = {
    total: 0,
    notifications: {}
  };
  error: any;
  subscription: BehaviorSubject<boolean>;

  constructor(
    private readonly notificationService: NotificationService,
    private readonly commonService: CommonService,
    private broadcaster: BroadcasterService
  ) {
    this.subscription = this.broadcaster.on('notification_count_update').subscribe(() => {
      this.fetchNotifications();
    });
  }

  ngOnInit(): void {
    this.fetchNotifications();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
            if (this.data.notifications[key] == null) {
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
