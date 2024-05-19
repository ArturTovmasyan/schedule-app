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
    // },
  };

  eventContent(arg: any) {
    // let description = arg.event._def.extendedProps['description'];
    let divEl = document.createElement('div');
    let title = arg.event.title;
    let time = arg.timeText;
    divEl.innerHTML = '<span>' + title + '</span><br/><span style="color: #047BDAFF">' + time + '</span>';
    return {html: divEl.innerHTML};
  }

  handleDateClick(arg: { dateStr: string; }) {
    alert('date click! ' + arg.dateStr)
  }
}
