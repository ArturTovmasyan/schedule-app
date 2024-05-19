import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ControlMessageComponent} from "../core/components/control-message/control-message.component";
import {NotificationComponent} from "../core/components/notification/notification.component";
import { NotificationItemComponent } from '../core/components/notification/notification-item/notification-item.component';
import {AvatarComponent} from "../core/components/avatar/avatar.component";
import {AcronymNamePipe} from "../core/pipes/acronym-name.pipe";

@NgModule({
  declarations: [
    ControlMessageComponent,
    NotificationComponent,
    NotificationItemComponent,
    AvatarComponent,
    AcronymNamePipe
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
    AcronymNamePipe
  ]
})

export class SharedModule {
}
