import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {ControlMessageComponent} from "../core/components/control-message/control-message.component";

@NgModule({
    declarations: [
        ControlMessageComponent
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
    ],
    exports: [
        FormsModule,
        ReactiveFormsModule,
        ControlMessageComponent,
    ]
})

export class SharedModule {
}
