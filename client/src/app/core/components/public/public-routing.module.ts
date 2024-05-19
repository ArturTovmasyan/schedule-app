import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PublicCalendarComponent } from './calendar/calendar.component';
import { GroupAvailabilityComponent } from './group-availibility/group-availability.component';

const routes: Routes = [
  {
    path: ':id',
    component: PublicCalendarComponent,
    children: [
      {
        path: '',
        component: GroupAvailabilityComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PublicRoutingModule { }
