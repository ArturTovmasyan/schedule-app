import {Component, OnDestroy} from '@angular/core';
import {BroadcasterService} from "../../../shared/services";
import {BehaviorSubject} from "rxjs";
import { CommonService } from '../../services/common.service';

@Component({
  selector: 'app-availability',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnDestroy {
  subscription: BehaviorSubject<boolean>;
  calendarFullSize: boolean = false;
  displayStyle: string = '';
  timezone = "";

  constructor(
    private readonly broadcaster: BroadcasterService,
    private readonly commonService: CommonService
  ) {
    this.timezone = `${this.commonService.formattedLocalTimezone}`;
    this.subscription = this.broadcaster.on('calendar_full_size').subscribe(() => {
      this.calendarFullSize = true;
      this.displayStyle = 'none';
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  openLeftMenu() {
    this.calendarFullSize = false;
    this.displayStyle = 'block';
  }
}
