import {Component, OnInit} from '@angular/core';
import {CalendarOptions} from "@fullcalendar/angular";
import {first} from "rxjs/operators";
import {CalendarService} from "../../../services/calendar/calendar.service";
import DateConverter from "../../helpers/date.converter";
// const $ = require( "jquery" )

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
    // this.fetchMyEvents();
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
                start: DateConverter.convertUTCDateToLocalDate(el.start),
                end: DateConverter.convertUTCDateToLocalDate(el.end),
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
    dayHeaderFormat: {weekday: 'short', day: 'numeric', omitCommas: true},
    direction: 'ltr',
    themeSystem: 'bootstrap',
    selectable: true,
    allDaySlot: false,
    droppable: true,
    eventTextColor: 'black',
    eventBackgroundColor: '#E9F6FD',
    eventOrderStrict: true,
    stickyHeaderDates: true,
    titleFormat: {
      year: 'numeric', month: 'long', day: 'numeric'
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },
    headerToolbar: {
      left: '',
      center: 'prev,title,next',
      right: 'today'
    },
    events: [
      {title: 'event 1 Test big title for resize event block', start: '2022-10-04T03:45:00', end: '2022-10-04T04:45:00', description: 'Event 1 description'},
      {title: 'event 2', start: '2022-10-05T07:45:00', end: '2022-10-05T08:45:00', description: 'Event 2 description'},
      {title: 'event 3', start: '2022-10-06T02:45:00', end: '2022-10-06T05:45:00', description: 'Event 3 description'},
      {title: 'event 4', start: '2022-10-07T10:45:00', end: '2022-10-07T12:45:00', description: 'Event 4 description'},
    ],
    eventContent: this.eventContent.bind(this),
    eventClassNames: function(arg) {
      const title = arg.event._def.title;
      if (title.length > 20) {
        return 'event-big';
      } else {
        return 'event-standard';
      }
    },
    // eventClick: function(arg) {
    //   if (confirm('Are you sure you want to delete this event?')) {
    //     arg.event.remove()
    //   }
    // },
    // dateClick: this.handleDateClick.bind(this),
    // select: function(arg) {
    //   debugger;
    // },
  };

  eventContent(arg: any) {
    let divEl = document.createElement('div');
    // let description = arg.event._def.extendedProps['description'];
    let title = arg.event.title;
    let time = arg.timeText;
    divEl.innerHTML = '<span>' + title + '</span><br/><span style="color: #047BDAFF">' + time + '</span>';
    return {html: divEl.innerHTML};
  }

  handleDateClick(arg: { dateStr: string; }) {
    alert('date click! ' + arg.dateStr)
  }
}
