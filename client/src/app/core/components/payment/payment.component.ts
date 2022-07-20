import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {ValidationService} from "../../../shared/services";
import {PaymentService} from "../../services/auth/payment/payment.service";

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.scss']
})
export class PaymentComponent implements OnInit {

  form: FormGroup;
  errorMessage: string | undefined;

  constructor(private formBuilder: FormBuilder, private paymentService: PaymentService) {
    this.form = this.formBuilder.group({
      number: ['', [ValidationService.cardNumber, Validators.required]],
      name: ['', [ValidationService.fullNameValidator, Validators.required]],
      expiration_date: ['', [ValidationService.cardExpireDate, Validators.required]],
      cvv: ['', [ValidationService.cardCvv, Validators.required, Validators.maxLength(3)]]
    });
  }

  ngOnInit(): void {
  }
}
