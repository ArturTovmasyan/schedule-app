import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable()
export class BroadcasterService {

  private events: any = {};

  broadcast(key: string, data?: any) {
    if (this.events[key] && this.events[key].length) {
      for (const ev of this.events[key]) {
        ev.next();
      }
    }
  }

  on<T>(key: any): any {

    if (!this.events[key] || !this.events[key].length) {
      this.events[key] = [new Subject<any>()];
    } else {
      this.events[key].push(new Subject<any>());
    }

    const currentSub = this.events[key][this.events[key].length - 1];

    return {
      subscribe: (cb: any) => {
        return currentSub.subscribe(cb);
      },
      unsubscribe: () => {
        currentSub.unsubscribe();
        this.events[key] = this.events[key].filter((ev: any) => {
          return ev !== currentSub;
        });
      }
    };
  }
}
