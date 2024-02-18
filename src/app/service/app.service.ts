import {HttpClient} from "@angular/common/http";
import {Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {Deliverer} from "../model/deliverer";
import {Delivery} from "../model/delivery";
import {EventType} from "../model/event-type";

@Injectable({
  providedIn: 'root'
})
export class AppService {
  protected url = 'https://delivery-pizza-a4ea7-default-rtdb.europe-west1.firebasedatabase.app';

  constructor(private http: HttpClient) {
  }

  findAllDeliverers(): Observable<Deliverer[]> {
    return this.http.get<Deliverer[]>(`${this.url}/deliverers.json`)
      .pipe(map(deliverersResponse => {
        const deliverers: Deliverer[] = [];
        for (const key in deliverersResponse) {
          const deliverer: Deliverer = deliverersResponse[key];
          deliverers.push({
            id: key,
            name: deliverer.name,
            delivered: deliverer.delivered,
            isActive: deliverer.isActive
          })
        }
        return deliverers;
      }))
  }

  findAllDelivieries(): Observable<Delivery[]> {
    return this.http.get<Delivery[]>(`${this.url}/delivery.json`)
      .pipe(map(deliveriesResponse => {
        const deliveries: Delivery[] = [];
        for (const key in deliveriesResponse) {
          const delivery: Delivery = deliveriesResponse[key];
          deliveries.push({
            id: key,
            type: EventType[delivery.type],
            restaurant: delivery.restaurant,
            date: new Date(delivery.date),
            delivererId: delivery.delivererId
          })
        }
        return deliveries;
      }))
  }

  getNextEvent(): Observable<Delivery> {
    return this.http.get<Delivery>(`${this.url}/next-event.json`);
  }

  updateNextEvent(event: Delivery): Observable<any> {
    return this.http.put(`${this.url}/next-event.json`, event);
  }
}
