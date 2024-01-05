import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';
import {MqMessage} from '../modal/mq-message';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private sender = new Subject<MqMessage>();

  constructor() { }

  send(message: MqMessage) {
    message.id = this.getUniqueId(4);
    this.sender.next(message);
  }


  getUniqueId(parts: number): string {
    const stringArr = [];
    for (let i = 0; i < parts; i++) {
      const S4 = (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
      stringArr.push(S4);
    }
    return stringArr.join('');
  }

  onMessage(callback: (message: MqMessage) => void) {
    this.sender.subscribe(callback)
  }

}
