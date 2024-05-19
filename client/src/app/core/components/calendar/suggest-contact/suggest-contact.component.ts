import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {CalendarInvitationService} from "../../../services/calendar/invitation.service";
import {first} from "rxjs";
import {SuggestContactService} from "../../../services/calendar/suggest-contact.service";

@Component({
  selector: 'app-suggest-contact',
  templateUrl: './suggest-contact.component.html',
  styleUrls: ['./suggest-contact.component.scss']
})
export class SuggestContactComponent implements OnInit {

  suggestForm!: FormGroup;
  formSubmitted = false;
  error: any = null;
  emails: string[] = [];
  showRequiredErrors = false;
  suggestContactEmail:string = '';
  shareCalendarAccess = true;
  requestCalendarAccess = true;

  constructor(
    private formBuilder: FormBuilder,
    private readonly invitationService: CalendarInvitationService,
    private readonly suggestService: SuggestContactService,
  ) {
    this.initSuggestContact();
  }

  initSuggestContact() {
    this.formSubmitted = false;

    this.suggestService.getSuggestContact()
      .pipe(first())
      .subscribe({
        next: (response) => {
          if (response.data.unregisteredEmails.length > 0) {
            this.suggestForm.patchValue({
              'emails': [response.data.unregisteredEmails[0]],
            });
          }
        },
        error: (error) => {
          this.error = error;
        }
      })
  }

  ngOnInit(): void {
    this.suggestForm = this.formBuilder.group({
      emails: [this.suggestContactEmail, Validators.required],
      shareMyCalendar: [this.shareCalendarAccess],
      requestCalendarView: [this.requestCalendarAccess],
    });

    this.initFormValue();
  }

  onShareStatusUpdate(event: Event) {
    this.shareCalendarAccess = (event.target as any).checked ?? true;
  }

  onRequestStatusUpdate(event: Event) {
    this.requestCalendarAccess = (event.target as any).checked ?? true;
  }

  initFormValue() {
    this.suggestForm.patchValue({
      'message': 'Hey All, \n\nPlease share your calendars with me so I can schedule with ease.'
    });
  }

  submit() {
    if (this.suggestForm.invalid) {
      this.showRequiredErrors = true;
    }

    this.invitationService.sendInvitation(this.suggestForm.value)
      .pipe(first())
      .subscribe({
        next: () => {
          this.formSubmitted = true;
          this.suggestForm.reset();
          this.initFormValue();
        },
        error: (error) => {
          this.error = error;
        }
      })
  }

  get f() {
    return this.suggestForm.controls;
  }
}
