import {Pipe, PipeTransform} from '@angular/core';
import {Deliverer} from '../model/deliverer';

@Pipe({
  name: 'delivererNames',
})
export class DelivererNamesPipe implements PipeTransform {
  transform(deliverers: Deliverer[]): string[] {
    return deliverers.map(d => d.name);
  }
}
