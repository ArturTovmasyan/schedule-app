import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Calendar, CalendarOptions, FullCalendarComponent } from '@fullcalendar/angular';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { PublicCalendarService } from '../public.service';
import { AVAILABILITY_EVENT_CLASS } from "../../../interfaces/constant/calendar.constant";

@Component({
  selector: 'app-public-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class PublicCalendarComponent implements OnDestroy {
  timezone = new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)?.[1];
  @ViewChild("calendar") calendar!: FullCalendarComponent;
  calendarApi!: Calendar;
  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    dayHeaderFormat: { weekday: 'short', day: '2-digit', omitCommas: true },
    direction: 'ltr',
    themeSystem: 'bootstrap',
    dayHeaders: true,
    editable: false,
    allDaySlot: false,
    eventTextColor: 'black',
    eventBackgroundColor: '#E9F6FD',
    eventOrderStrict: true,
    stickyHeaderDates: true,
    windowResizeDelay: 100,
    dragRevertDuration: 500,
    handleWindowResize: false,
    expandRows: false,
    showNonCurrentDates: true,
    lazyFetching: false,
    firstDay: 1,
    windowResize: (view) => {
      view.view.calendar.updateSize();
    },
    eventClick: function (eventInfo: any) {
      const calendar = eventInfo.view.calendar;
      calendar.updateSize();
    },
    selectable: false,
    slotLabelFormat: [
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        meridiem: 'lowercase',
        separator: '.'
      }
    ],
    titleFormat: {
      month: 'long', day: 'numeric'
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short',
      hour12: true
    },
    headerToolbar: {
      left: '',
      center: 'prev,title,next',
      right: ''
    },
    eventContent: this.eventContent.bind(this),
    eventClassNames: function () {
      return 'event';
    },
    select: (info) => {
      console.log(info);
    },
    selectOverlap: function (info) {
      return true;
    }
  }

  linkId: string;
  destroySubscription = new Subject();
  calendarData$ = this.calendarService.calendarData$$;
  openSelectedWeek$ = new Subscription;

  constructor(
    private route: ActivatedRoute,
    private readonly calendarService: PublicCalendarService,
  ) {
    this.linkId = this.route.snapshot.params['id'];
    this.calendarService.getDetails(this.linkId).subscribe();
    this.openSelectedWeek();
  }

  eventContent(arg: any) {
    const divEl = document.createElement('div');
    const title = arg.event.title;
    const time = arg.timeText;

    if (title) {
      divEl.innerHTML = '<span>' + title + '</span><br/><span style="color: #047BDAFF; font-size: 8pt; text-wrap: avoid">' + time + '</span>';
    } else {
      divEl.innerHTML = '<span style="color: #047BDAFF;font-size: 8pt; text-wrap: avoid">' + time + '</span>';
    }
    return { html: divEl.innerHTML };
  }

  ngOnInit(): void {
    this.calendarData$
      .pipe(takeUntil(this.destroySubscription))
      .subscribe((data: any) => {
        if (data?.slots) {
          console.log(data);
          const datas = [];
          for (const date of data.slots) {
            datas.push({
              start: date.startDate,
              end: date.endDate
            });
          }
          this.calendarOptions.selectable = true;
          this.calendarOptions.slotDuration = '00:30:00';
          this.calendarOptions.slotLabelInterval = 30;
          this.calendarOptions.businessHours = this.getAvailableSlots(datas)[0];
          this.calendarOptions.selectConstraint = "businessHours";
          this.calendarOptions.events = this.getAvailableSlots(datas)[1];
        }
      })
  }

  ngAfterViewChecked() {
    this.calendarApi = this.calendar.getApi();
  }

  getAvailableSlots(dates: any){
    const availabilitySlots: any = [];
    const availabilityEvents: any = [];
    for (const key in dates) {
      const weekDay = new Date(dates[key].start).getDay();
      availabilitySlots.push({
        daysOfWeek: [weekDay],
        startTime: dates[key].start,
        endTime: dates[key].end
      })
      availabilityEvents.push({
        start: dates[key].start,
        end: dates[key].end,
        className: AVAILABILITY_EVENT_CLASS
      })
    }
    return [availabilitySlots, availabilityEvents];
  }

  openSelectedWeek() {
    this.openSelectedWeek$ = this.calendarService.openSelectedWeek()
      .subscribe(res => {
        this.calendarApi.gotoDate(res);
        console.log('subscription res', res);
      });
  }

  ngOnDestroy(): void {
    this.destroySubscription.next(true);
    this.destroySubscription.complete();
    this.openSelectedWeek$.unsubscribe();
  }

}
