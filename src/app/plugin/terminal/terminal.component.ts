import { ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, inject } from '@angular/core';
import { MessageType } from 'src/app/enums/message-type';
import { Message } from 'src/app/modal/message';
import { window } from "@tauri-apps/api"

import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { message } from '@tauri-apps/plugin-dialog';
import { RunLog } from 'src/app/modal/run-log';


@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.css',
})
export class TerminalComponent implements OnInit {

  running: boolean = false;

  @ViewChild("xterm") xterm!: ElementRef;

  @ViewChild("xtermView") xtermView!: ElementRef;

  @Output()
  runClick: EventEmitter<String> = new EventEmitter();
  changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild("content") content!: ElementRef;


  xtermFocused = false;

  xtermValue: string = '';

  message = Array<Message>();

  xtermViewML() {
    this.xterm.nativeElement.blur();
    this.xtermFocused = false;
  }

  public setQMsg(msg: string) {    
    this.message.push(Message.q(msg));
  }

  public setAMsg(msg: string) {
    this.message.push(Message.a(msg));
  }

  async ngOnInit(): Promise<void> {
    await window.getCurrent().listen<RunLog>('println', data => {
      const res = data.payload;
      this.setAMsg(res.msg);
      if(res.logType === "result") {
          this.running = false;
          this.xterm.nativeElement.blur();
          this.xterm.nativeElement.focus();
          this.xtermFocused = true;
      }
    });
  }


  xtermViewClick($event: MouseEvent) {
    this.xterm.nativeElement.focus();
    this.xtermFocused = true;
  }


  xtermChange($event: Event) {
    $event.preventDefault();
  }

  async play($event: MouseEvent) {
    this.message = []
    this.running = true;
    this.setQMsg("run");
    this.runClick.emit("run");
  }

  async clear($event: MouseEvent) {
    this.message = [];
    this.setQMsg("clear");
  }


  xtermKeyDown(event: KeyboardEvent) {
    if (event.key === "Enter") {
      this.setQMsg(this.xtermValue);
      switch (this.xtermValue) {
        case "help":
          this.setAMsg("run       运行代码");
          this.setAMsg("clear     清屏")
          break
        case "clear":
          this.message = [];
          this.setQMsg("clear")
          break
        case "run":
          this.message = [];
          this.setQMsg("run")
          this.runClick.emit("run");
          break
        default:
          this.setAMsg('不支持此命令');
      }
      this.xtermValue = '';
    }
  }


  async copyClick($event: MouseEvent) {
    const copyText = this.message.filter(x=>x.type === MessageType.A).map(x=>x.message).join("\n");
    await writeText(copyText);
    await message("复制成功");
  }

}
