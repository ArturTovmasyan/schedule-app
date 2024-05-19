import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import * as moment from 'moment';
import { BehaviorSubject } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { BroadcasterService } from "../../../../shared/services";

@Component({
  selector: 'app-sharable-link',
  templateUrl: './sharable-link.component.html',
  styleUrls: ['./sharable-link.component.scss']
})
export class SharableLinkComponent implements OnInit, OnDestroy {

  subscription: BehaviorSubject<boolean>;
  selectedDates$: BehaviorSubject<any> = new BehaviorSubject([]);
  selectedDates:any = []

  get timezone(): string {
    return this.commonService.localTimezone;
  }

  constructor(
    private readonly broadcaster: BroadcasterService,
    private readonly commonService: CommonService,
    private readonly cd: ChangeDetectorRef
  ) {
    this.subscription = this.broadcaster.on('selectSharableLinkDates').subscribe((dates: any) => {
      const startdate = moment.utc(dates.start).local().format('ddd, MMM Do');
      if (this.selectedDates[startdate]) {
        this.selectedDates[startdate].push(dates);
      } else {
        this.selectedDates[startdate] = [dates];
      }
      this.selectedDates[startdate].sort(function (left:any, right:any) {
        return moment.utc(left.start).diff(moment.utc(right.start))
      });


      const sortedObject = Object.fromEntries(
        Object.entries(this.selectedDates).sort(([a,], [b,]) => {
          return moment(a, "MMM-YY").diff(moment(b, "MMM-YY"));
        })
      )

      this.selectedDates$.next(sortedObject);
    });
  }


  ngOnInit(): void {
    // this.broadcaster.broadcast('contact_calendar_data', []);
    this.broadcaster.broadcast('multiselect_calendar', true);
  }

  removeTime(date: any, i: any) {
    const selectedDate = this.selectedDates[date].splice(i, 1);
    if (this.selectedDates[date].length == 0) {
      delete this.selectedDates[date];
    }
    this.selectedDates$.next(this.selectedDates);
    this.broadcaster.broadcast('removeSharableLinkTimeSlot', selectedDate);
  }



  ngOnDestroy(): void {
    this.broadcaster.broadcast('reset_event');
  }

}
