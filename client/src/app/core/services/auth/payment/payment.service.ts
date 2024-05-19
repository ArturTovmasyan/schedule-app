import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private readonly http: HttpClient) {}

  charge(amount: number, paymentMethodId: string, customerId: string) {
    return this.http.post<any>('/api/payment/charge', {amount, paymentMethodId, customerId}).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  addCreditCard(paymentMethodId: string, customerId: string) {
    return this.http.post<any>('/api/payment/add/credit-cards', {paymentMethodId, customerId}).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  addStandardSubscription(customerId: string) {
    return this.http.post<any>('/api/subscriptions/standard', {customerId}).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  addProfessionalSubscription(customerId: string) {
    return this.http.post<any>('/api/subscriptions/professional', {customerId}).pipe(
      map((response: any) => {
        return response;
      })
    );
  }
}
