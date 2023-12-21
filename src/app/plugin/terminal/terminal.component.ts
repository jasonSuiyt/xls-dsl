import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, inject, signal } from '@angular/core';
import { MessageType } from 'src/app/enums/message-type';
import { Message } from 'src/app/modal/message';
import { appWindow } from "@tauri-apps/api/window";
import { writeText } from '@tauri-apps/api/clipboard';
import { message } from '@tauri-apps/api/dialog';
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
    console.log(msg);
    
    this.message.push(Message.q(msg));
  }

  public setAMsg(msg: string) {
    console.log(msg);
    this.message.push(Message.a(msg));
  }

  async ngOnInit(): Promise<void> {
    await appWindow.listen<RunLog>('println', (data) => {
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
    setTimeout(()=>{
      this.running = false;
    },10000)
  }

  async clear($event: MouseEvent) {
    this.message = [];
    this.setQMsg("clear");
  }


  xtermKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 13) {

      this.setQMsg(this.xtermValue);
      switch (this.xtermValue) {
        case "help":
          this.setAMsg("run       运行代码");
          this.setAMsg("clear     清屏")
          break
        case "clear":
          this.message = [];
          break
        case "run":
          this.message = [];
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
