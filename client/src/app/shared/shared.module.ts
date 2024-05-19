import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {ControlMessageComponent} from "../core/components/control-message/control-message.component";
import {NotificationComponent} from "../core/components/notification/notification.component";

@NgModule({
  declarations: [
    ControlMessageComponent,
    NotificationComponent
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
    NotificationComponent
  ]
})

export class SharedModule {
}
