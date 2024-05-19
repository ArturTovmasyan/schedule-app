import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {CalendarComponent} from "./calendar.component";
import {AccessRequestComponent} from "./access-request/access-request.component";
import { ShareCalendarComponent } from './share-calendar/share-calendar.component';
import { ContactsComponent } from './contacts/contacts.component';
import { MeetingComponent } from './meeting/meeting.component';
import { ProposeTimeSlotComponent } from './propose-time-slot/propose-time-slot.component';

@NgModule({
    declarations: [
      CalendarComponent,
      AccessRequestComponent,
      ShareCalendarComponent,
      ContactsComponent,
      MeetingComponent,
      ProposeTimeSlotComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,
    ]
})

export class CalendarModule {
}
