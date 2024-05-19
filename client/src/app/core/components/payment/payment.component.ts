import { Component, OnInit } from '@angular/core';
<<<<<<< HEAD
=======
import {BroadcasterService} from "../../../shared/services";
>>>>>>> 6b35d68 (Create Goolge Login Functionality, Change in Auth systems)

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

<<<<<<< HEAD
  constructor() { }

  ngOnInit(): void {
  }

=======
  constructor(private broadcaster: BroadcasterService) { }

  ngOnInit(): void {
    this.broadcaster.broadcast('logged', true);
  }
>>>>>>> 6b35d68 (Create Goolge Login Functionality, Change in Auth systems)
}
