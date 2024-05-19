import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { Subscription, first } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { CalendarInvitationService } from '../../../services/calendar/invitation.service';
import {BroadcasterService} from "../../../../shared/services";
import { AuthService } from 'src/app/core/services/auth/auth.service';

@Component({
  selector: 'app-invite-and-connect',
  templateUrl: './invite-and-connect.component.html',
  styleUrls: ['./invite-and-connect.component.scss']
})
export class InviteAndConnectComponent implements OnInit, OnDestroy {

  subscription$!: Subscription;
  inviteForm!: FormGroup;
  formSubmitted = false;
  error: any = null;
  emails: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private readonly invitationService: CalendarInvitationService,
    private readonly commonService: CommonService,
    private readonly broadcaster: BroadcasterService,
    private readonly authService: AuthService
  ) { }

  ngOnInit(): void {

    this.inviteForm = this.formBuilder.group({
      emails: [null, Validators.required],
      message: [''],
      shareMyCalendar: [false],
      requestCalendarView: [false],
      duration: [null],
      endDate: [null]
    });

    this.initFormValue();

    
  }

  get f() {
    return this.inviteForm.controls;
  }

  initFormValue(defaultValues: any = null) {
    if (!defaultValues) {
      defaultValues = {
        'duration': 2,
        'shareMyCalendar': true,
        'requestCalendarView': true,
      }
    }

    this.subscription$ = this.authService.currentUser.subscribe({
      next: (res: any) => {
        this.inviteForm.patchValue({'message': `Hey All, \n\nPlease share your calendars with me so I can schedule with ease.\n\n${res?.user?.fullName}`})
      }
    });
    this.inviteForm.patchValue(defaultValues);
  }

  onCustomDateUpdate(event: Event) {
    const value = (event.target as any).value;
    this.inviteForm.patchValue({
      'endDate': moment(value, 'YYYY-MM-DD').add(1, 'day')
    });
  }

  onDurationSelectionChanged(index: number){
    let endDate = null;
    switch (index) {
      case 0:
        endDate = moment(new Date()).add(3, 'weeks');
        break;
      case 1:
        endDate = moment(new Date()).add(1, 'month');
        break;
      default:
        break;
    }

    this.inviteForm.patchValue({
      'duration': index,
      'endDate': this.commonService.getFormattedDateString(endDate)
    });
  }

  updateEmails(emails: string[]) {
    this.error = null;
    this.inviteForm.patchValue({
      'emails': emails
    });
  }

  submit() {
    if (!this.inviteForm.valid) {
      this.error = { 'message' : 'Please enter the email' };
      return;
    }

    this.invitationService.sendInvitation(this.inviteForm.value)
    .pipe(first())
    .subscribe({
      next: () => {
        const formValues = this.inviteForm.value;
        this.formSubmitted = true;
        this.resetForm();
        
        this.initFormValue(formValues);
      },
      error: (error) => {
        this.error = error;
      }
    })
  }

  resetForm() {
    this.inviteForm.reset();
    this.emails = [];
    for (const control in this.inviteForm.controls) {
      this.inviteForm.controls[control].setErrors(null);
    }
  }

  close() {
    this.broadcaster.broadcast('calendar_full_size', true);
  }

  ngOnDestroy(): void {
    this.subscription$.unsubscribe();
  }
}
