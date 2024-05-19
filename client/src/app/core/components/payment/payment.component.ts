import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidationService} from "../../../shared/services";
import {PaymentService} from "../../services/auth/payment/payment.service";
import {ErrorResponse} from "../../interfaces/error/error-response.interface";
<<<<<<< HEAD
=======
import {environment} from "../../../../environments/environment";
import {STANDARD_PLAN_NAME} from "../../interfaces/constant/payment.constant";
>>>>>>> f477641 (Cretae subs. table, add payment functionality)

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  form: FormGroup;
  error?: ErrorResponse;

  constructor(private formBuilder: FormBuilder, private paymentService: PaymentService) {
    this.form = this.formBuilder.group({
      number: ['', [ValidationService.cardNumber, Validators.required]],
      name: ['', [ValidationService.fullNameValidator, Validators.required]],
      expiration_date: ['', [ValidationService.cardExpireDate, Validators.required]],
      cvv: ['', [ValidationService.cardCvv, Validators.required, Validators.maxLength(3)]]
    });
  }

  cvvMask = {mask: "{000}"}
  dateMask = {mask: "{00}/{00}"};
  cardNumberMask = {mask: "0000 0000 0000 0000"};

  ngOnInit(): void {
    this.loadStripe();
  }
}
