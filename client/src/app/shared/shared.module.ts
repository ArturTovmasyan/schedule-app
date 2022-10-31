import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ControlMessageComponent} from "../core/components/control-message/control-message.component";
import {NotificationComponent} from "../core/components/notification/notification.component";
import { NotificationItemComponent } from '../core/components/notification/notification-item/notification-item.component';

@NgModule({
  declarations: [
    ControlMessageComponent,
    NotificationComponent,
    NotificationItemComponent
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
    NotificationItemComponent
  ]
})

export class SharedModule {
}
