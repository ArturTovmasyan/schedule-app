import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar } from '@fullcalendar/core';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { Location } from 'src/app/core/interfaces/calendar/location.interface';
import { AVAILABILITY_EVENT_CLASS } from 'src/app/core/interfaces/constant/calendar.constant';
import { BroadcasterService } from 'src/app/shared/services';
import { MeetViaEnum } from '../../../calendar/enums/sharable-links.enum';
import { SelectedTimeSlotData } from '../interfaces/selected-timeslot.interface';
import { PublicCalendarService } from '../calendar.service';
import { PublicSidebarCalendarComponent } from '../sidebar-calendar/sidebar-calendar.component';

type OldTimeSlotData = {
  timeslot: any,
  timeslotId: string
};

@Component({
  selector: 'app-reschedule-meeting',
  templateUrl: './reschedule-meeting.component.html',
  styleUrls: ['./reschedule-meeting.component.scss']
})
export class RescheduleMeetingComponent extends PublicSidebarCalendarComponent implements OnInit, OnDestroy {

  oldTimeSlotData: OldTimeSlotData = {
    timeslot: null,
    timeslotId: ''
  };
  componentData: SelectedTimeSlotData = {
    selectedTimeSlot: null,
    selectedTimeSlotId: null
  };
  calendarApi!: Calendar;
  @ViewChild("calendar") calendar!: FullCalendarComponent;
  readonly MeetViaEnum = MeetViaEnum;
  destroy$ = new Subject();

  linkId: string;
  scheduledId: string;
  attendees: any;
  location: Location | undefined;
  form!: FormGroup;
  selectedSlot: any;
  meetingTitle!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    calendarService: PublicCalendarService,
    private broadcaster: BroadcasterService,
    private toastrService: ToastrService
  ) {
    super(calendarService);
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
        const datas = [];
        for (const date of data.slots) {
          if (date.choosedByEmail && date.id == this.scheduledId) {
            datas.push({
              id: date.id,
              groupId: 'defaultSelectedSlot',
              start: date.startDate,
              end: date.endDate
            });
            this.oldTimeSlotData.timeslot = {
              start: date.startDate,
              end: date.endDate
            }
            this.oldTimeSlotData.timeslotId = date.id;
          } else {
            datas.push({
              id: date.id,
              groupId: 'availableSlot',
              start: date.startDate,
              end: date.endDate,
              className: AVAILABILITY_EVENT_CLASS
            });
          }
        }
        this.broadcaster.broadcast('loadAvailableTimeslots', datas);
        this.calendarOptions.events = datas;

        if (data?.attendees?.length > 0) {
          this.attendees = data.attendees;
        } else {
          this.attendees = [{
            id: data.user.id,
            user: data.user
          }];
        }
        this.meetingTitle = data?.title;
      });

      this.onTimeSlotSelected();
  }

  ngAfterViewChecked() {
    this.calendarApi = this.calendar.getApi();
  }

  onTimeSlotSelected() {
    this.destroy$ = this.broadcaster.on('timeSlotSelected')
      .subscribe((data: SelectedTimeSlotData) => {
        this.componentData = data;
      });
  }

  initForm() {
    this.form = this.formBuilder.group({
      reason: ['', [Validators.required]]
    }, { updateOn: 'blur' });
  }

  submit() {
    if (!this.form.valid){
      this.form.markAllAsTouched();
      return;
    }
    if (!this.componentData.selectedTimeSlotId) {
      this.toastrService.error('Please select timeslot first', 'Error', {
        timeOut: 3000
      });
    }
    const formData = this.form.value;
    formData['newSlotId'] = this.componentData.selectedTimeSlotId;
    this.calendarService.reScheduleMeeting(this.oldTimeSlotData.timeslotId, formData)
      .subscribe({
        next: () => {
          this.toastrService.success('Successfully Rescheduled', 'Success', {
            timeOut: 3000
          });
          this.calendarApi.gotoDate(new Date());
          this.router.navigate([`/share/${this.linkId}`]);
        },
        error: (err) => {
          this.toastrService.error(err.error.message, 'Error', {
            timeOut: 3000
          });
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

}
