import {EventType} from "./event-type";

export interface Delivery {
  id: string;
  type: EventType,
  restaurant: string,
  date: Date,
  delivererId: string
}
