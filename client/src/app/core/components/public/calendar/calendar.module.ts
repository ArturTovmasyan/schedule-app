import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IMaskModule } from 'angular-imask';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { SharedModule } from 'src/app/shared/shared.module';
import { PublicCalendarComponent } from './calendar/calendar.component';
import { GroupAvailabilityComponent } from './group-availibility/group-availability.component';
import { PublicCalendarRoutingModule } from './calendar-routing.module';
import { PublicCalendarService } from './calendar.service';
import { FullCalendarModule } from '@fullcalendar/angular';

import { BroadcasterService } from 'src/app/shared/services';
import { CancelMeetingComponent } from './cancel-meeting/cancel-meeting.component';
import { RescheduleMeetingComponent } from './reschedule-meeting/reschedule-meeting.component';

@NgModule({
  declarations: [
    PublicCalendarComponent,
    GroupAvailabilityComponent,
    CancelMeetingComponent,
    RescheduleMeetingComponent
  ],
  imports: [
    PublicCalendarRoutingModule,
    CommonModule,
    SharedModule,
    IMaskModule,
    HttpClientModule,
    FullCalendarModule,
    NgHttpLoaderModule.forRoot()
  ],
  providers: [PublicCalendarService, DatePipe, BroadcasterService]
})
export class PublicCalendarModule { }
