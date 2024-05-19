import {Component, OnInit} from '@angular/core';
import {CalendarOptions} from "@fullcalendar/angular";

@Component({
  selector: 'app-full-calendar',
  templateUrl: './full-calendar.component.html',
  styleUrls: ['./full-calendar.component.scss']
})
export class FullCalendarComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }

  calendarOptions: CalendarOptions = {
    initialView: 'timeGridWeek',
    dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true },
    direction: 'ltr',
    selectable: true,
    allDaySlot: false,
    droppable: true,
    dateClick: this.handleDateClick.bind(this),
    headerToolbar: {
      left: '',
      center: 'prev,title,next',
      right: 'today'
    },
    events: [
      { title: 'event 1', date: '2022-09-25T05:45:00' },
      { title: 'event 111', date: '2022-09-25T06:43:00' },
      { title: 'event 1', date: '2022-09-26T08:22:00' },
      { title: 'event 1', date: '2022-09-27T12:30:00' },
      { title: 'event 2', date: '2022-09-22T12:30:00' }
    ],
    eventTextColor: 'black',   // an option!
    eventBackgroundColor: '#E9F6FD',   // an option!
    eventOrderStrict: true,
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    }
  };

  handleDateClick(arg: { dateStr: string; }) {
    alert('date click! ' + arg.dateStr)
  }
}
