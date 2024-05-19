import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicCalendarComponent } from './calendar/calendar.component';
import { CancelMeetingComponent } from './cancel-meeting/cancel-meeting.component';
import { GroupAvailabilityComponent } from './group-availibility/group-availability.component';
import { RescheduleMeetingComponent } from './reschedule-meeting/reschedule-meeting.component';

const routes: Routes = [
  {
    path: ':id',
    component: PublicCalendarComponent,
    children: [
      {
        path: '',
        component: GroupAvailabilityComponent
      },
      {
        path: 'cancel/:scheduledId',
        component: CancelMeetingComponent
      },
      {
        path: 'reschedule/:scheduledId',
        component: RescheduleMeetingComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicCalendarRoutingModule { }
