import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map} from "rxjs/operators";
import {PROFESSIONAL_PLAN_NAME} from "../../../interfaces/constant/payment.constant";

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  constructor(private readonly http: HttpClient) {}

  async charge(amount: number, paymentMethodId: string, customerId: string) {
    return this.http.post<any>('/api/payment/charge', {amount, paymentMethodId, customerId}).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

    addCreditCard(card: any, customerId: string) {
    return this.http.post<any>('/api/payment/add/credit-cards', {card, customerId}).pipe(
      map((response: any) => {
        debugger;
        return response;
      })
    );
  }

   addSubscription(customerId: string, plan: string, paymentMethodId: string) {

    debugger;
      if (plan === PROFESSIONAL_PLAN_NAME) {
        return this.http.post<any>('/api/subscriptions/professional', {customerId, paymentMethodId}).pipe(
          map((response: any) => {
            return response;
          })
        );
      } else {
        return this.http.post<any>('/api/subscriptions/standard', {customerId, paymentMethodId}).pipe(
          map((response: any) => {
            return response;
          })
        );
      }
  }

  async addStandardSubscription(customerId: string) {
    return this.http.post<any>('/api/subscriptions/standard', {customerId}).pipe(
      map((response: any) => {
        return response;
      })
    );
  }

  async addProfessionalSubscription(customerId: string) {
    return this.http.post<any>('/api/subscriptions/professional', {customerId}).pipe(
      map((response: any) => {
        return response;
      })
    );
  }
}
