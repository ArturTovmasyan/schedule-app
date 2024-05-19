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
<<<<<<< HEAD
=======
import { ChipEmailInputComponent } from '../chip-input/chip-email-input.component';
import { InviteAndConnectComponent } from './invite-and-connect/invite-and-connect.component';
>>>>>>> 8a0cab6 (Add invite and connect component)

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  bootstrapPlugin,
  interactionPlugin,
  timeGridPlugin
]);

@NgModule({
  declarations: [
    CalendarComponent,
    AccessRequestComponent,
    ShareCalendarComponent,
    ContactsComponent,
    MeetingComponent,
    ProposeTimeSlotComponent,
<<<<<<< HEAD
    MyCalendarComponent
=======
    ChipEmailInputComponent,
    MyCalendarComponent,
    InviteAndConnectComponent
>>>>>>> 8a0cab6 (Add invite and connect component)
  ],
  imports: [
    CommonModule,
    RouterModule,
    FullCalendarModule
  ],
  providers: [DatePipe]
})

export class CalendarModule {
}
