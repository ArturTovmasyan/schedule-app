import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ControlMessageComponent} from "../core/components/control-message/control-message.component";
import {NotificationComponent} from "../core/components/notification/notification.component";
import { NotificationItemComponent } from '../core/components/notification/notification-item/notification-item.component';
import {AvatarComponent} from "../core/components/avatar/avatar.component";
import {AcronymNamePipe} from "../core/pipes/acronym-name.pipe";
import { ParseTimePipe } from "../core/pipes/parse-time.pipe";
import { ScrollTrackerDirective } from './directives/scroll-tracker.directive';
import { FormDirective } from './directives/form.directive';

@NgModule({
  declarations: [
    ControlMessageComponent,
    NotificationComponent,
    NotificationItemComponent,
    AvatarComponent,
    ScrollTrackerDirective,
    FormDirective,
    AcronymNamePipe,
    ParseTimePipe
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    ControlMessageComponent,
    NotificationComponent,
    NotificationItemComponent,
    AvatarComponent,
    ScrollTrackerDirective,
    FormDirective,
    AcronymNamePipe,
    ParseTimePipe
  ]
})

export class SharedModule {
}
