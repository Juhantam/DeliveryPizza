import {Component, OnDestroy, OnInit, ViewChild, AfterViewInit, ViewChildren, QueryList} from '@angular/core';
import {MatSort} from "@angular/material/sort";
import {MatTableDataSource} from "@angular/material/table";
import {Subscription} from "rxjs";
import {Deliverer} from "./model/deliverer";
import {Delivery} from "./model/delivery";
import {EventType} from "./model/event-type";
import {AppService} from "./service/app.service";
import {AuthService} from "./service/auth.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  delivererColumnsToDisplay: string[] = ['name', 'delivered', 'isActive'];
  deliveryColumnsToDisplay: string[] = ['type', 'date', 'restaurant', 'deliverer'];

  subscriptions: Subscription[] = [];

  deliverersDataSource = new MatTableDataSource<Deliverer>();
  deliveriesDataSource = new MatTableDataSource<Delivery>();
  nextEvent: Delivery[];
  nextDeliverer: Deliverer;

  showLoginInput = false;
  password = '';
  loginError = '';
  isLoggingIn = false;

  @ViewChild('deliveriesSort') deliveriesSort: MatSort;
  @ViewChild('deliverersSort') deliverersSort: MatSort;

  constructor(private appService: AppService, public authService: AuthService) {
  }

  ngOnInit() {
    this.subscriptions.push(this.appService.findAllDeliverers().subscribe(deliverers => {
      this.deliverersDataSource.data = deliverers
        .sort((a, b) => Number(b.isActive) - Number(a.isActive));
    }));
    this.subscriptions.push(this.appService.findAllDelivieries().subscribe(deliveries => {
      this.deliveriesDataSource.data = deliveries
        .sort((delivery1, delivery2) => delivery2.date?.getTime() - delivery1.date?.getTime());
    }));
    this.subscriptions.push(this.appService.getNextEvent().subscribe(event => this.nextEvent = [event]));
  }

  ngAfterViewInit() {
    this.deliveriesDataSource.sort = this.deliveriesSort;
    this.deliverersDataSource.sort = this.deliverersSort;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getNameOfDeliverer(delivererId: string): string {
    return this.deliverersDataSource.data?.find(deliverer => deliverer.id === delivererId)?.name ?? 'Teadmata';
  }

  getNextDeliverer() {
    const suitableDeliverers = this.deliverersDataSource.data.filter(deliverer => deliverer.isActive && !deliverer.delivered);
    const randomNumber = this.getRandomInt(suitableDeliverers.length);
    this.nextDeliverer = suitableDeliverers[randomNumber];
    this.nextEvent[0].delivererId = this.nextDeliverer.id;
    this.subscriptions.push(this.appService.updateNextEvent(this.nextEvent[0]).subscribe());
  }

  onAuthButtonClick(): void {
    if (this.authService.isAuthenticated) {
      this.authService.logout();
      this.showLoginInput = false;
    } else {
      this.showLoginInput = !this.showLoginInput;
      this.loginError = '';
    }
  }

  onLogin(): void {
    if (!this.password || this.isLoggingIn) return;

    this.isLoggingIn = true;
    this.loginError = '';

    this.subscriptions.push(
      this.authService.login(this.password).subscribe({
        next: () => {
          this.password = '';
          this.isLoggingIn = false;
          this.showLoginInput = false;
        },
        error: (err: Error) => {
          this.isLoggingIn = false;
          if (err.message.startsWith('TOO_MANY_ATTEMPTS')) {
            this.loginError = 'Liiga palju katseid, proovi hiljem';
          } else {
            this.loginError = 'Vale parool';
          }
        }
      })
    );
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
