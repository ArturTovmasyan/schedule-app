import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarOptions } from '@fullcalendar/angular';
import dayGridPlugin from '@fullcalendar/daygrid';
import * as moment from 'moment';
import { Subject } from 'rxjs';
import { Location } from 'src/app/core/interfaces/calendar/location.interface';
import { BroadcasterService } from 'src/app/shared/services';
import { MeetViaEnum } from '../../calendar/enums/sharable-links.enum';
import { PublicCalendarService } from '../public.service';

type ComponentData = {
  selectedTimeSlot: any,
  timezone: any
};

@Component({
  selector: 'app-cancel-meeting',
  templateUrl: './cancel-meeting.component.html',
  styleUrls: ['./cancel-meeting.component.scss']
})
export class CancelMeetingComponent implements OnInit, OnDestroy {

  componentData: ComponentData = {
    selectedTimeSlot: null,
    timezone: ''
  };
  readonly MeetViaEnum = MeetViaEnum;
  destroy$ = new Subject();
  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    plugins: [dayGridPlugin],
    height: '400px',
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
      }
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
      this.changeWeek(info.start);
    },
    selectOverlap: function (info) {
      return true;
    }
  }
  linkId: string;
  scheduledId: string;
  attendees: any;
  location: Location | undefined;
  form!: FormGroup;
  selectedSlot: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private calendarService: PublicCalendarService,
    private broadcaster: BroadcasterService
  ) {

    this.linkId = route.snapshot.parent?.params['id'];
    this.scheduledId = route.snapshot.params['scheduledId'];
    this.initForm();
  }

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.calendarService.getDetails(this.linkId)
      .subscribe((data: any) => {
        if (data?.slots) {
          const datas = [];
          for (const date of data.slots) {
            datas.push({
              start: date.startDate,
              end: date.endDate
            });
          }
          this.broadcaster.broadcast('loadAvailableTimeslots', datas);
          // may need in future
          // this.location = this.calendarService.getLocations().find(res => res.value == data['meetVia']);
          this.calendarOptions.events = datas;
        }

        if (data?.attendees?.length > 0) {
          this.attendees = data.attendees;
        }

        // selected timeslot from api
        const timezone = new Date().toString().match(/([A-Z]+[\+-][0-9]+.*)/)?.[1];
        this.componentData.selectedTimeSlot = {
          start: new Date(),
          end: new Date()
        }
        this.componentData.timezone = timezone;
      });

  }

  initForm() {
    this.form = this.formBuilder.group({
      notes: ['', [Validators.required]]
    }, { updateOn: 'blur' });
  }

  changeWeek(date:any) {
    this.calendarService.selectedWeek.next(date);
  }

  cancelMeeting() {
    if (!this.form.valid){
      this.form.markAllAsTouched();
      return;
    }
    const formData = this.form.value;
    formData['selectedTimeslot'] = this.componentData.selectedTimeSlot;
    return;
  }

  addValidation(controlName: string) {
    this.form.controls[controlName].setValidators(Validators.required);
    this.form.controls[controlName].updateValueAndValidity();
  }

  removeValidation(controlName: string) {
    this.form.controls[controlName].clearValidators();
    this.form.controls[controlName].updateValueAndValidity();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
