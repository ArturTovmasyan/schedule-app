import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarOptions } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import * as moment from 'moment';
import { Subject, takeUntil } from 'rxjs';
import { PublicCalendarService } from '../public.service';
@Component({
  selector: 'app-group-availability',
  templateUrl: './group-availability.component.html',
  styleUrls: ['./group-availability.component.scss']
})
export class GroupAvailabilityComponent implements OnInit, OnDestroy {

  destroySubscription = new Subject();
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    height: 'auto',
    nowIndicator: true,
    direction: 'ltr',
    themeSystem: 'bootstrap',
    dayHeaders: true,
    editable: false,
    eventOrderStrict: true,
    stickyHeaderDates: true,
    windowResizeDelay: 100,
    dragRevertDuration: 500,
    handleWindowResize: false,
    expandRows: false,
    showNonCurrentDates: true,
    lazyFetching: false,
    firstDay: 1,
    eventDisplay: 'block',
    eventStartEditable: false,
    slotMinWidth: 1,
    eventDurationEditable: false,
    dayHeaderFormat: { weekday: 'narrow' },
    windowResize: (view) => {
      view.view.calendar.updateSize();
    },
    eventClick: function (eventInfo: any) {
      const calendar = eventInfo.view.calendar;
      calendar.updateSize();
    },
    eventDidMount: function (info) {
      if (info.el.closest('.fc-daygrid-day')) {
        const hh = moment(info.event.start).isSame(new Date(), 'isoWeek');
        info.el.closest('.fc-daygrid-day')?.classList.add('fc-event-div');
        if (hh) {
          info.el.closest('.fc-daygrid-day')?.classList.add('current-week');
        } else {
          info.el.closest('.fc-daygrid-day')?.classList.add('na-week');
        }
      }
    },
    selectable: true,
    slotLabelFormat: [
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        meridiem: 'lowercase',
        separator: '.'
      }
    ],
    views: {
      month: {
        columnHeaderFormat: 'dd'
      },
    },
    titleFormat: {
      month: 'short', day: 'numeric'
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
    eventClassNames: function (args) {
      return 'eventooo';
    },
    select: (info) => {
      console.log('info', info);
      this.changeWeek(info.start);
    },
    selectOverlap: function (info) {
      return true;
    }
  }
  linkId: string;
  calendarData$ = this.calendarService.calendarData$$;
  attendees: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private calendarService: PublicCalendarService
  ) {
    this.linkId = route.snapshot.params['id'];
  }


  ngOnInit(): void {
    this.calendarData$
    .pipe(takeUntil(this.destroySubscription))
    .subscribe((data: any) => {
      if (data?.slots) {
        const datas = [];
        for (const date of data.slots) {
          datas.push({
            start: date.startDate,
            end: date.endDate
          });
        }
        this.calendarOptions.events = datas;
      }
      if (data?.attendees?.length > 0) {
        this.attendees = data.attendees;
      }
    })
  }

  changeWeek(date:any) {
    this.calendarService.selectedWeek.next(date);

  }

  ngOnDestroy(): void {
    this.destroySubscription.next(true);
    this.destroySubscription.complete();
  }

}
