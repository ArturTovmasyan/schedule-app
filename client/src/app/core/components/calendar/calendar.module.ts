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
import {FullCalendarComponent} from "./full-calendar/full-calendar.component";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';

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
    FullCalendarComponent
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
