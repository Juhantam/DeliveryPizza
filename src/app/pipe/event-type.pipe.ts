import {Pipe, PipeTransform} from '@angular/core';
import {EventType} from "../model/event-type";

@Pipe({
  name: 'eventType',
})
export class EventTypePipe implements PipeTransform {

  transform(value: EventType): string {
    switch (value) {
      case EventType.DELIVERY_PIZZA:
        return 'Tarnepitsa';
      case EventType.TEAM_LUNCH:
        return 'Tiimilõuna';
      default:
        return '';
    }
  }
}
