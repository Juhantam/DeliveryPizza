import {Component, OnInit} from '@angular/core';
import {Deliverer} from "./model/deliverer";
import {Delivery} from "./model/delivery";
import {AppService} from "./service/app.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  delivererColumnsToDisplay: string[] = ['name', 'delivered', 'isActive'];
  deliveryColumnsToDisplay: string[] = ['type', 'date', 'restaurant', 'deliverer'];

  deliverers: Deliverer[]
  deliveries: Delivery[]

  constructor(private appService: AppService) {
  }

  ngOnInit() {
    this.appService.findAllDeliverers().subscribe(deliverers => this.deliverers = deliverers);
    this.appService.findAllDelivieries().subscribe(deliveries => this.deliveries = deliveries);;
  }

  getNameOfDeliverer(delivererId: string): string {
    return this.deliverers.find(deliverer => deliverer.id === delivererId)?.name ?? 'Teadmata';
  }
}
