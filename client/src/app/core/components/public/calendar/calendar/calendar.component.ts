import { Component, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import interactionPlugin from '@fullcalendar/interaction';
import {  FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar, CalendarOptions } from '@fullcalendar/core';
import { Subject, takeUntil } from 'rxjs';
import { PublicCalendarService } from '../calendar.service';
import { AVAILABILITY_EVENT_CLASS } from "../../../../interfaces/constant/calendar.constant";
import { BroadcasterService } from 'src/app/shared/services';
import * as moment from 'moment';
import { CommonService } from 'src/app/core/services/common.service';
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import rrulePlugin from '@fullcalendar/rrule';

@Component({
  selector: 'app-public-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class PublicCalendarComponent implements OnDestroy {
  destroy$ = new Subject();
  @ViewChild("calendar") calendar!: FullCalendarComponent;
  componentData = {
    isTimeslotSelected: false,
    selectedTimeSlot: null,
    selectedTimeSlotId: null
  };
  calendarApi!: Calendar;
  calendarOptions: CalendarOptions = {
    height: 'auto',
    initialView: 'timeGridWeek',
    plugins: [interactionPlugin, dayGridPlugin, timeGridPlugin, bootstrapPlugin, rrulePlugin],
    dayHeaderFormat: { weekday: 'short', day: '2-digit', omitCommas: true },
    direction: 'ltr',
    themeSystem: 'bootstrap',
    dayHeaders: true,
    editable: true,
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
    windowResize: (view: any) => {
      view.view.calendar.updateSize();
    },
    // eventClick: function (eventInfo: any) {
    //   const calendar = eventInfo.view.calendar;
    //   calendar.updateSize();
    // },
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
    select: (info: any) => {
      this.componentData['selectedTimeSlot'] = info;
      this.componentData['isTimeslotSelected'] = true;
      this.broadcaster.broadcast('timeSlotSelected', this.componentData);
    },
    selectOverlap: this.selectOverlapFunc.bind(this)
  }

  linkId: string;

  constructor(
    private route: ActivatedRoute,
    private readonly calendarService: PublicCalendarService,
    private broadcaster: BroadcasterService,
    private readonly commonService: CommonService,
  ) {
    this.linkId = this.route.snapshot.params['id'];

    this.openSelectedWeek();
  }


  selectOverlapFunc(args: any) {
    this.componentData['selectedTimeSlotId'] = args._def.publicId;
    return args._def.ui.classNames[0] == AVAILABILITY_EVENT_CLASS;
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

  get timezone() {
    return this.commonService.formattedLocalTimezone;
  }

  ngOnInit(): void {
    // load for group availability only
    this.loadBroadcastEvents();
  }

  ngAfterViewChecked() {
    this.calendarApi = this.calendar.getApi();
  }

  loadBroadcastEvents() {
    this.destroy$ = this.broadcaster.on('loadAvailableTimeslots')
      .subscribe((data: any) => {
        if (data) {
          this.calendarOptions.selectable = true;
          this.calendarOptions.slotDuration = '00:30:00';
          this.calendarOptions.slotLabelInterval = 30;
          this.calendarOptions.selectConstraint = "availableSlot";
          this.calendarOptions.events = data;
          // this.calendarOptions.validRange = {
          //   start: moment().toDate(),
          //   end: moment().add(2, 'year').toDate()
          // }
        }
      });
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
        groupId: 'availableSlot',
        start: new Date(dates[key].start),
        end: new Date(dates[key].end),
        className: AVAILABILITY_EVENT_CLASS
      })
    }
    return [availabilitySlots, availabilityEvents];
  }

  // TODO: to be used if timezone related error
  getLocaleTime(date: string): string {
    const offset = moment().utcOffset() / 60;
    const utcTime = moment(date).add(offset, 'hour');
    return this.commonService.getFormattedDateString(utcTime, 'HH:mm') ?? "";
  }

  openSelectedWeek() {
    this.calendarService.openSelectedWeek()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        this.calendarApi.gotoDate(res);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
