import { Component, ElementRef, ViewChild } from '@angular/core';
import { MessageType } from 'src/app/enums/message-type';
import { Message } from 'src/app/modal/message';

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.css'
})
export class TerminalComponent {

  @ViewChild("xterm") xterm!: ElementRef;

  xtermFocused = false;

  xtermValue: string = '';

  messages: Array<Message> = [];

  xtermViewML() {
    console.log("xtermViewML")
    this.xterm.nativeElement.blur();
    this.xtermFocused = false;
  }


  xtermViewClick($event: MouseEvent) {
    this.xterm.nativeElement.focus();
    this.xtermFocused = true;
  }


  xtermChange($event: Event) {
    $event.preventDefault();
  }


  xtermKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      this.messages.push({
        message: this.xtermValue,
        type: MessageType.Q
      });
      switch (this.xtermValue) {
        case "help":
          break
        case "clear":
          this.messages = [];
          break
        case "run":
          break
        default:
          this.messages.push({
            message: '不支持此命令',
            type: MessageType.A
          });
      }
      this.xtermValue = '';
    }
  }



}
