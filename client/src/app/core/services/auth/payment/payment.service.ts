import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from "rxjs/operators";
import {PROFESSIONAL_PLAN_NAME} from "../../../interfaces/constant/payment.constant";

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private readonly http: HttpClient) {
  }

  charge(amount: number, paymentMethodId: string, customerId: string) {
    return this.http.post<any>('/api/payment/charge', {amount, paymentMethodId, customerId}).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  addCreditCard(card: any, customerId: string) {
    return this.http.post<any>('/api/payment/add/credit-cards', {card, customerId}).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  addSubscription(plan: string, stripeToken: string) {

    if (plan === PROFESSIONAL_PLAN_NAME) {
      return this.http.post<any>('/api/subscriptions/professional', {stripeToken}).pipe(
        map((response: any) => {
          return response;
        })
      );
    } else {
      return this.http.post<any>('/api/subscriptions/standard', {stripeToken}).pipe(
        map((response: any) => {
          return response;
        })
      );
    }
  }

  getPublishKey() {
    return this.http.get<any>('/api/payment/publish-key', ).pipe(
      map((response: any) => {
        return response;
      })
    );
  }
}
