import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {Deliverer} from '../model/deliverer';
import {EventType} from '../model/event-type';
import {AppService} from '../service/app.service';
import {AuthService} from '../service/auth.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent implements OnInit, OnDestroy {
  subscriptions: Subscription[] = [];
  deliverers: Deliverer[] = [];

  eventTypes = [
    {value: EventType.DELIVERY_PIZZA, label: 'Tarnepitsa'},
    {value: EventType.TEAM_LUNCH, label: 'Tiimilõuna'}
  ];

  // Add event form
  eventType: string = EventType.DELIVERY_PIZZA;
  eventRestaurant = '';
  eventDate: Date | null = null;
  eventDelivererId = '';
  eventSuccess = '';
  eventError = '';

  // Set next event form
  nextEventType: string = EventType.DELIVERY_PIZZA;
  nextEventRestaurant = '';
  nextEventDate: Date | null = null;
  nextEventDelivererId = '';
  nextEventSuccess = '';
  nextEventError = '';

  // Add deliverer form
  delivererName = '';
  delivererSuccess = '';
  delivererError = '';

  constructor(private appService: AppService, public authService: AuthService) {
  }

  ngOnInit() {
    this.subscriptions.push(this.appService.findAllDeliverers().subscribe(deliverers => {
      this.deliverers = deliverers.sort((a, b) => Number(b.isActive) - Number(a.isActive));
    }));
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  onAddEvent(): void {
    this.eventSuccess = '';
    this.eventError = '';

    this.subscriptions.push(this.appService.createDelivery({
      type: this.eventType,
      restaurant: this.eventRestaurant,
      date: this.formatDate(this.eventDate),
      delivererId: this.eventDelivererId
    }).subscribe({
      next: () => {
        this.eventSuccess = 'Üritus lisatud!';
        this.eventRestaurant = '';
        this.eventDate = null;
        this.eventDelivererId = '';
      },
      error: () => {
        this.eventError = 'Ürituse lisamine ebaonnestus';
      }
    }));
  }

  onSetNextEvent(): void {
    this.nextEventSuccess = '';
    this.nextEventError = '';

    this.subscriptions.push(this.appService.updateNextEvent({
      id: '',
      type: EventType[this.nextEventType as keyof typeof EventType],
      restaurant: this.nextEventRestaurant,
      date: this.nextEventDate!,
      delivererId: this.nextEventDelivererId
    }).subscribe({
      next: () => {
        this.nextEventSuccess = 'Järgmine üritus määratud!';
        this.nextEventRestaurant = '';
        this.nextEventDate = null;
        this.nextEventDelivererId = '';
      },
      error: () => {
        this.nextEventError = 'Järgmise ürituse määramine ebaonnestus';
      }
    }));
  }

  private formatDate(date: Date | null): string {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onAddDeliverer(): void {
    this.delivererSuccess = '';
    this.delivererError = '';

    this.subscriptions.push(this.appService.createDeliverer({
      name: this.delivererName,
      delivered: false,
      isActive: true
    }).subscribe({
      next: () => {
        this.delivererSuccess = 'Korraldaja lisatud!';
        this.delivererName = '';
      },
      error: () => {
        this.delivererError = 'Korraldaja lisamine ebaonnestus';
      }
    }));
  }
}
