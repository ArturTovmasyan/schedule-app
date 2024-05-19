import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidationService} from "../../../shared/services";
import {PaymentService} from "../../services/payment/payment.service";
import {ErrorResponse} from "../../interfaces/error/error-response.interface";
@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  form: FormGroup;
  error?: ErrorResponse;
  cvvMask = {mask: "{000}"}
  dateMask = {mask: "{00}/{00}"};
  cardNumberMask = {mask: "0000 0000 0000 0000"};
  stripePublishKey: string = "";

  constructor(
    private formBuilder: FormBuilder,
    private paymentService: PaymentService,
    // private spinner: SpinnerVisibilityService,
    private router: Router) {
    this.form = this.formBuilder.group({
      number: ['', [ValidationService.cardNumber, Validators.required]],
      name: ['', [ValidationService.fullNameValidator, Validators.required]],
      expiration_date: ['', [ValidationService.cardExpireDate, Validators.required]],
      cvv: ['', [ValidationService.cardCvv, Validators.required, Validators.maxLength(3)]]
    });
  }

  ngOnInit(): void {
    this.getStripePublishKey();
  }
}
