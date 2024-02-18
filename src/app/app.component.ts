import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {Deliverer} from "./model/deliverer";
import {Delivery} from "./model/delivery";
import {EventType} from "./model/event-type";
import {AppService} from "./service/app.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  delivererColumnsToDisplay: string[] = ['name', 'delivered', 'isActive'];
  deliveryColumnsToDisplay: string[] = ['type', 'date', 'restaurant', 'deliverer'];

  subscriptions: Subscription[] = [];

  deliverers: Deliverer[]
  deliveries: Delivery[]
  nextEvent: Delivery[];
  nextDeliverer: Deliverer;

  constructor(private appService: AppService) {
  }

  ngOnInit() {
    this.subscriptions.push(this.appService.findAllDeliverers().subscribe(deliverers => this.deliverers = deliverers));
    this.subscriptions.push(this.appService.findAllDelivieries().subscribe(deliveries => this.deliveries = deliveries
      .sort((delivery1, delivery2) => delivery1.date?.getTime() - delivery2.date?.getTime())));
    this.subscriptions.push(this.appService.getNextEvent().subscribe(event => this.nextEvent = [event]));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getNameOfDeliverer(delivererId: string): string {
    return this.deliverers?.find(deliverer => deliverer.id === delivererId)?.name ?? 'Teadmata';
  }

  getNextDeliverer() {
    const suitableDeliverers = this.deliverers.filter(deliverer => deliverer.isActive && !deliverer.delivered);
    const randomNumber = this.getRandomInt(suitableDeliverers.length);
    this.nextDeliverer = suitableDeliverers[randomNumber];
    this.nextEvent[0].delivererId = this.nextDeliverer.id;
    this.subscriptions.push(this.appService.updateNextEvent(this.nextEvent[0]).subscribe());
  }

  isDeliveryPizza(delivery: Delivery): boolean {
    return delivery.type === EventType.DELIVERY_PIZZA;
  }

  private setRandomNextDeliverer(suitableDeliverers: Deliverer[], randomNumber: number): void {
    this.nextDeliverer = suitableDeliverers[this.getRandomInt(suitableDeliverers.length)];
  }

  private getRandomInt(max: number): number {
    return Math.floor(Math.random() * max);
  }
}
