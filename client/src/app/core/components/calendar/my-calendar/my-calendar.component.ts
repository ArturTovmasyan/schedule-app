import {Component, OnDestroy, OnInit} from '@angular/core';
import {CalendarOptions} from "@fullcalendar/angular";
import {first} from "rxjs/operators";
import {CalendarService} from "../../../services/calendar/calendar.service";
// import DateConverter from "../../helpers/date.converter";
import {BroadcasterService} from "../../../../shared/services";
import {BehaviorSubject} from "rxjs";
// import * as moment from 'moment';

@Component({
  selector: 'app-my-calendar',
  templateUrl: './my-calendar.component.html',
  styleUrls: ['./my-calendar.component.scss']
})
export class MyCalendarComponent implements OnInit, OnDestroy {
  events: any = [];
  error: any = null;
  calendarApi: any;
  myEvents: any;
  contactEvents: any;
  contactAvailabilityDates: any;
  subscription: BehaviorSubject<boolean>;

  constructor(private calendarService: CalendarService, private broadcaster: BroadcasterService) {
    this.subscription = this.broadcaster.on('contact_calendar_data').subscribe((contactAvailabilities: any) => {
      debugger;
      const availabilityDates: any[] = [];
      const contactId = contactAvailabilities.contactId;

      if (dates) {
      // if (dates) {
      //   let weekDays = dates.weekDays;
        // delete dates['contactId'];
        for (const key in dates) {

          avalEvents.push({
            // start: DateConverter.convertToLocalDate(new Date(dates[key].start)),
            // end: DateConverter.convertToLocalDate(new Date(dates[key].end)),
            start: dates[key].start,
            end: dates[key].end,
            className: 'available-event',
          })

          //TODO check BusinessHour and Event date diff
          const date1 = new Date(dates[key].start);
          const date2 = new Date(dates[key].end);
          const hoursAndMinutes1 = String(date1).padStart(2, '0') + ':' + String(date1.getMinutes()).padStart(2, '0');
          const hoursAndMinutes2 = String(date2.getHours()).padStart(2, '0') + ':' + String(date2.getMinutes()).padStart(2, '0');

          debugger;
          const day = new Date(dates[key].start).getDay();
          availabilityDates.push({
            daysOfWeek: [day],
            // startTime: moment(dates[key].start).utc().format('hh:mm'),
            // endTime: moment(dates[key].end).utc().format('hh:mm'),
            startTime: hoursAndMinutes1,
            endTime: hoursAndMinutes2,
          })
        }

        this.contactAvailabilityDates = availabilityDates;

        // this.fetchContactEvents(contactId);
        this.calendarOptions.events = this.myEvents.concat(availabilityDates);
      }
    });
  }

  ngOnInit(): void {
    this.fetchMyEvents();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  fetchMyEvents() {
    this.calendarService.fetchEvents()
      .pipe(first())
      .subscribe({
        next: (events: any) => {
          const data: any[] = [];
          if (events.length > 0) {
            events.forEach((el: any) => {
              data.push({
                // start: DateConverter.convertToLocalDate(new Date(el.start)),
                // end: DateConverter.convertToLocalDate(new Date(el.end)),
                start: el.start,
                end: el.end,
                title: el.title,
                description: el.description,
              })
            })
            this.myEvents = data;
            this.calendarOptions.events = data;
          }
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  fetchContactEvents(userId: string) {
    this.calendarService.fetchContactEvents(userId)
      .pipe(first())
      .subscribe({
        next: (events: any) => {
          const data: any[] = [];
          if (events.length > 0) {
            events.forEach((el: any) => {
              data.push({
                start: DateConverter.convertUTCDateToLocalDate(new Date(el.start)),
                end: DateConverter.convertUTCDateToLocalDate(new Date(el.end)),
                className: 'available-event'
              })
            })
            this.contactEvents = data;
            // this.calendarOptions.events = data;
          }
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    // timeZone: 'Asia/Yerevan',
    dayHeaderFormat: {weekday: 'short', day: '2-digit', omitCommas: true},
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
    select: function(info) {
      console.log(info.startStr);
      console.log(info.endStr);
    },
    selectOverlap: function(event) {
      return true;
    },
  };

  eventContent(arg: any) {
    let divEl = document.createElement('div');
    let title = arg.event.title;
    let time = arg.timeText;

    if (title) {
      divEl.innerHTML = '<span>' + title + '</span><br/><span style="color: #047BDAFF">' + time + '</span>';
    } else {
      divEl.innerHTML = '<span style="color: #047BDAFF">' + time + '</span>';
    }
    return {html: divEl.innerHTML};
  }
}
