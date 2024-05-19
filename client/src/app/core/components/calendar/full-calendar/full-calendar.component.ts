import {Component, OnInit} from '@angular/core';
import {CalendarOptions} from "@fullcalendar/angular";
import {first} from "rxjs/operators";
import {CalendarService} from "../../../services/calendar/calendar.service";
import {DatePipe} from "@angular/common";

@Component({
  selector: 'app-full-calendar',
  templateUrl: './full-calendar.component.html',
  styleUrls: ['./full-calendar.component.scss']
})
export class FullCalendarComponent implements OnInit {

  events: any = [];
  error: any = null;

  constructor(private calendarService: CalendarService, public datePipe: DatePipe) {
  }

  ngOnInit(): void {
    this.fetchMyEvents();
  }

  fetchMyEvents() {
    this.calendarService.fetchEvents()
      .pipe(first())
      .subscribe({
        next: (events: any) => {
          const data: { start: any; end: any; title: any; }[] = [];

          if (events.length > 0) {
            events.forEach((el: any) => {
              data.push({
                start: this.datePipe.transform(new Date(el.start), 'yyyy-MM-ddThh:mm:ss'),
                end: this.datePipe.transform(new Date(el.end), 'yyyy-MM-ddThh:mm:ss'),
                title: el.description
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
    // themeSystem: 'bootstrap',
    selectable: true,
    allDaySlot: false,
    droppable: true,
    dateClick: this.handleDateClick.bind(this),
    eventTextColor: 'black',   // an option!
    eventBackgroundColor: '#E9F6FD',   // an option!
    eventOrderStrict: true,
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },
    titleFormat: {
      year: 'numeric', month: 'long', day: 'numeric'
    },
    headerToolbar: {
      left: '',
      center: 'prev,title,next',
      right: 'today'
    },
    events: [],
  };

  handleDateClick(arg: { dateStr: string; }) {
    alert('date click! ' + arg.dateStr)
  }
}
