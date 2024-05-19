import {Component, OnInit} from '@angular/core';
import {CalendarOptions} from "@fullcalendar/angular";
import {first} from "rxjs/operators";
import {CalendarService} from "../../../services/calendar/calendar.service";
import DateConverter from "../../helpers/date.converter";

@Component({
  selector: 'app-my-calendar',
  templateUrl: './my-calendar.component.html',
  styleUrls: ['./my-calendar.component.scss']
})
export class MyCalendarComponent implements OnInit {
  events: any = [];
  error: any = null;
  calendarApi: any;

  constructor(private calendarService: CalendarService) {}

  ngOnInit(): void {
    this.fetchMyEvents();
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
                start: DateConverter.convertUTCDateToLocalDate(new Date(el.start)),
                end: DateConverter.convertUTCDateToLocalDate(new Date(el.end)),
                title: el.title,
                description: el.description
              })
            })
            this.calendarOptions.events = data;
          }
        },
        error: (error) => {
          this.error = error;
        }
      });
  }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    dayHeaderFormat: {weekday: 'short', day: '2-digit', omitCommas: true},
    direction: 'ltr',
    themeSystem: 'bootstrap',
    dayHeaders:true,
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
    slotLabelFormat: [
      {
        hour: 'numeric',
        minute: '2-digit',
        hour12:true,
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
    events: [],
    eventContent: this.eventContent.bind(this),
    eventClassNames: function(arg) {
      //TODO get contact availability times
      if (true) {
        return 'event';
      }
      return 'available-event';
    }
  };

  eventContent(arg: any) {
    let divEl = document.createElement('div');
    let title = arg.event.title;
    let time = arg.timeText;

    //TODO check if available event change background here.
    divEl.innerHTML = '<span>' + title + '</span><br/><span style="color: #047BDAFF">' + time + '</span>';
    return {html: divEl.innerHTML};
  }
}
