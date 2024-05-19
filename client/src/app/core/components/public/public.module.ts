import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { IMaskModule } from 'angular-imask';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { SharedModule } from 'src/app/shared/shared.module';
import { CalendarModule } from '../calendar/calendar.module';
import { PublicCalendarComponent } from './calendar/calendar.component';
import { GroupAvailabilityComponent } from './group-availibility/group-availability.component';
import { PublicRoutingModule } from './public-routing.module';
import { PublicCalendarService } from './public.service';
import { FullCalendarModule } from '@fullcalendar/angular';

//PLUGINS
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from '@fullcalendar/timegrid';
import bootstrapPlugin from '@fullcalendar/bootstrap';
import rrulePlugin from '@fullcalendar/rrule';
import { BroadcasterService } from 'src/app/shared/services';

FullCalendarModule.registerPlugins([
  dayGridPlugin,
  bootstrapPlugin,
  interactionPlugin,
  timeGridPlugin,
  rrulePlugin
]);

@NgModule({
  declarations: [
    PublicCalendarComponent,
    GroupAvailabilityComponent
  ],
  imports: [
    PublicRoutingModule,
    CommonModule,
    SharedModule,
    IMaskModule,
    HttpClientModule,
    CalendarModule,
    FullCalendarModule,
    NgHttpLoaderModule.forRoot()
  ],
  providers: [PublicCalendarService, DatePipe, BroadcasterService]
})
export class PublicCalendarModule { }
