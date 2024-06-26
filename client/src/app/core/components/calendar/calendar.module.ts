import {NgModule} from '@angular/core';
import {FullCalendarModule} from "@fullcalendar/angular";
import {RouterModule} from '@angular/router';
import {CommonModule, DatePipe} from '@angular/common';
import {CalendarComponent} from "./calendar.component";
import {AccessRequestComponent} from "./access-request/access-request.component";
import {ShareCalendarComponent} from './share-calendar/share-calendar.component';
import {ContactsComponent} from './contacts/contacts.component';
import {MeetingComponent} from './meeting/meeting.component';
import {ProposeTimeSlotComponent} from './propose-time-slot/propose-time-slot.component';
import {MyCalendarComponent} from "./my-calendar/my-calendar.component";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import rrulePlugin from '@fullcalendar/rrule';
import { SharableLinkComponent } from './sharable-link/sharable-link.component';
import { GroupAvailabilityComponent } from './group-availability/group-availability.component'
import { SharableLinkService } from '../../services/calendar/sharable-link.service';
import { SharableLinkListComponent } from './sharable-link-list/sharable-link-list.component';
import { SharableLinkItemComponent } from './sharable-link-item/sharable-link-item.component';
import { ChipUserInputComponent } from '../chip-user-input/chip-user-input.component';
import { ChipUserItemComponent } from '../chip-user-item/chip-user-item.component';

@NgModule({
  declarations: [
    CalendarComponent,
    AccessRequestComponent,
    ShareCalendarComponent,
    ContactsComponent,
    MeetingComponent,
    ProposeTimeSlotComponent,
    MyCalendarComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FullCalendarModule,
    SharedModule,
    NgMultiSelectDropDownModule.forRoot()
  ],
  providers: [DatePipe, GetContactNamePipe, GetContactCompanyPipe, SharableLinkService]
})

export class CalendarModule {
}
