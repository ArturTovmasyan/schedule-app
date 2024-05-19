import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarOptions } from '@fullcalendar/angular';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { PublicCalendarService } from '../public.service';
import { AVAILABILITY_EVENT_CLASS, SUGGEST_EVENT_CLASS } from "../../../interfaces/constant/calendar.constant";

@Component({
  selector: 'app-public-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class PublicCalendarComponent implements OnDestroy {
  timezone = new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)?.[1];
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
    showNonCurrentDates: false,
    lazyFetching: false,
    windowResize: (view) => {
      alert('asdads');
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
      right: 'today'
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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private readonly calendarService: PublicCalendarService,
  ) {
    this.linkId = route.snapshot.params['id'];
    this.calendarService.getDetails(this.linkId).subscribe();
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
        if (data.slots) {
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

  getAvailableSlots(dates: any){
    const availabilitySlots: any = [];
    const availabilityEvents: any = [];
    console.log('dd', dates);
    for (const key in dates) {
      console.log('ff', dates[key].start);
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

  ngOnDestroy(): void {
    this.destroySubscription.next(true);
    this.destroySubscription.complete();
  }

}
