import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';
import { first } from 'rxjs';
import { CommonService } from 'src/app/core/services/common.service';
import { CalendarInvitationService } from '../../../services/calendar/invitation.service';
import {BroadcasterService} from "../../../../shared/services";

@Component({
  selector: 'app-invite-and-connect',
  templateUrl: './invite-and-connect.component.html',
  styleUrls: ['./invite-and-connect.component.scss']
})
export class InviteAndConnectComponent implements OnInit {

  inviteForm!: FormGroup;
  formSubmitted = false;
  error: any = null;
  emails: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private readonly invitationService: CalendarInvitationService,
    private readonly commonService: CommonService,
    private readonly broadcaster: BroadcasterService,
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

  initFormValue() {
    this.inviteForm.patchValue({
      'duration': 2,
      'message': 'Hey All, \n\nPlease share your calendars with me so I can schedule with ease.'
    });
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
        endDate = moment(new Date()).add(2, 'weeks');
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
        this.formSubmitted = true;
        this.resetForm();
        this.initFormValue();
      },
      error: (error) => {
        this.error = error;
      }
    })
  }

  resetForm() {
    this.inviteForm.reset();
    for (const control in this.inviteForm.controls) {
      this.inviteForm.controls[control].setErrors(null);
    }
  }

  close() {
    this.broadcaster.broadcast('calendar_full_size', true);
  }
}
