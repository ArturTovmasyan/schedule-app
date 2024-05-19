import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import * as moment from 'moment';
import { PublicCalendarService } from '../public.service';

export class PublicSidebarCalendarComponent  {

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
        if (info.event._def.groupId == 'defaultSelectedSlot') {
          info.el.closest('.fc-daygrid-day')?.classList.add('default-selected-date');
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
      return 'evento';
    },
    select: (info: any) => {
      this.changeWeek(info.start);
    },
    selectOverlap: function (info) {
      return true;
    }
  }

  constructor( public calendarService: PublicCalendarService) { }

  changeWeek(date: any) {
    this.calendarService.selectedWeek.next(date);
  }

}
