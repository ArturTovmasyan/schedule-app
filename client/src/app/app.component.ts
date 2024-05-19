import { Component } from '@angular/core';
const $ = require('jquery');
import * as moment from 'moment-timezone';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'Handshake';

  constructor() {
    console.log(moment.tz.guess());
  }
}
