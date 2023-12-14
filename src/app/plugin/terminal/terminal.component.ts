import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, inject, signal } from '@angular/core';
import { MessageType } from 'src/app/enums/message-type';
import { Message } from 'src/app/modal/message';
import { appWindow } from "@tauri-apps/api/window";


@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.css',
})
export class TerminalComponent implements OnInit {


  @ViewChild("xterm") xterm!: ElementRef;

  @Output()
  runClick: EventEmitter<String> = new EventEmitter();
  changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild("content") content!: ElementRef;

  xtermFocused = false;

  xtermValue: string = '';

  messages: Array<Message> = [];

  xtermViewML() {
    console.log("xtermViewML")
    this.xterm.nativeElement.blur();
    this.xtermFocused = false;
  }

  public setMsg(msg: string) {
    this.messages.push({
      message: msg,
      type: MessageType.A
    })
  }

  async ngOnInit(): Promise<void> {
  
    await appWindow.listen('println', (data) => {
      const content = this.content.nativeElement as HTMLInputElement
      //this.setMsg(data.payload as string);
      let div = document.createElement("div");
      div.classList.add("text-black");
      div.classList.add("dark:text-white");
      div.innerHTML = data.payload as string;
      content.append(div);
    });
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
      })
      switch (this.xtermValue) {
        case "help":
          break
        case "clear":
          const content = this.content.nativeElement as HTMLInputElement;
          content.innerHTML = "";
          this.messages = [];
          break
        case "run":
          this.runClick.emit("run");
          break
        default:
          this.messages.push({
            message: '不支持此命令',
            type: MessageType.A
          })
      }
      this.xtermValue = '';
    }
  }



}
