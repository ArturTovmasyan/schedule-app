import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar } from '@fullcalendar/core';
import { Subject } from 'rxjs';
import { Location } from 'src/app/core/interfaces/calendar/location.interface';
import { AVAILABILITY_EVENT_CLASS } from 'src/app/core/interfaces/constant/calendar.constant';
import { BroadcasterService } from 'src/app/shared/services';
import { MeetViaEnum } from '../../../calendar/enums/sharable-links.enum';
import { PublicCalendarService } from '../calendar.service';
import { SelectedTimeSlotData } from '../interfaces/selected-timeslot.interface';
import { PublicSidebarCalendarComponent } from '../sidebar-calendar/sidebar-calendar.component';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-cancel-meeting',
  templateUrl: './cancel-meeting.component.html',
  styleUrls: ['./cancel-meeting.component.scss']
})
export class CancelMeetingComponent extends PublicSidebarCalendarComponent implements OnInit, OnDestroy {

  componentData: SelectedTimeSlotData = {
    selectedTimeSlot: null,
    selectedTimeSlotId: null
  };

  @ViewChild("calendar") calendar!: FullCalendarComponent;
  calendarApi!: Calendar;
  readonly MeetViaEnum = MeetViaEnum;
  destroy$ = new Subject();
  linkId: string;
  scheduledId: string;
  attendees: any;
  location: Location | undefined;
  form!: FormGroup;
  selectedSlot: any;
  errorMessage = '';
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
        if (data?.slots) {
          // load available timeslots on calendar
          const datas = [];
          
          for (const slot of data.slots) {
            if (slot.choosedByEmail && slot.id == this.scheduledId) {
              datas.push({
                id: slot.id,
                groupId: 'defaultSelectedSlot',
                start: slot.startDate,
                end: slot.endDate
              });
              this.componentData.selectedTimeSlot = {
                start: slot.startDate,
                end: slot.endDate
              }
              
              this.componentData.selectedTimeSlotId = slot.id;
            } else {
              datas.push({
                id: slot.id,
                groupId: 'notAvailableSlot',
                start: slot.startDate,
                end: slot.endDate,
                className: AVAILABILITY_EVENT_CLASS
              });
            }
          }
          this.broadcaster.broadcast('loadAvailableTimeslots', datas);
          this.calendarOptions.events = datas;
        }
        if (data?.attendees?.length > 0) {
          this.attendees = data.attendees;
        } else {
          this.attendees = [{
            id: data.user.id,
            user: data.user
          }];
        }
        this.calendarApi.gotoDate(this.componentData.selectedTimeSlot.start);
        this.calendarService.selectedWeek.next(this.componentData.selectedTimeSlot.start);
        this.meetingTitle = data?.title;
      });
  }

  ngAfterViewChecked() {
    this.calendarApi = this.calendar.getApi();
  }

  initForm() {
    this.form = this.formBuilder.group({
      reason: ['', [Validators.required]]
    }, { updateOn: 'blur' });
  }

  cancelMeeting() {
    if (!this.form.valid){
      this.form.markAllAsTouched();
      return;
    }
    const formData = this.form.value;
    this.calendarService.cancelSelectedSlotMeeting(this.scheduledId, formData)
      .subscribe({
        next: () => {
          this.calendarApi.gotoDate(new Date());
          this.toastrService.success('Successfully Cancelled Meetinf', 'Success', {
            timeOut: 3000
          });
          this.router.navigate([`/share/${this.linkId}`]);
        },
        error: (err) => {
          this.toastrService.error(err.error.message, 'Error', {
            timeOut: 3000
          });
        }
      });
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
