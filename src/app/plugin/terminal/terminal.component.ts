import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  Output,
  ViewChild,
  inject,
  ChangeDetectionStrategy
} from '@angular/core';
import { MessageType } from 'src/app/enums/message-type';
import { Message } from 'src/app/modal/message';
import { appWindow } from "@tauri-apps/api/window";
import { writeText } from '@tauri-apps/api/clipboard';
import { message } from '@tauri-apps/api/dialog';
import { RunLog } from 'src/app/modal/run-log';
import {
  CdkVirtualScrollableElement,
  CdkVirtualScrollableWindow,
  CdkVirtualScrollViewport, ScrollingModule,
  VirtualScrollStrategy
} from "@angular/cdk/scrolling";
import {debounceTime, fromEvent, throttleTime} from "rxjs";
import {MqType} from "../../enums/mq-type";
import {MessageService} from "../../service/message.service";


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

  @ViewChild("content") content!: ElementRef;

  @ViewChild(CdkVirtualScrollViewport, { static: true }) scrollViewport!: CdkVirtualScrollViewport;


  constructor(public messageSrv: MessageService) { }


  message = Array<Message>();

  async setAMsg(msg: string) {
    if(msg.indexOf("\n")){
      msg.split("\n").map(x=>Message.a(x)).forEach(x=>{
        this.message.push(x)
      })
    }else {
      this.message.push(Message.a(msg))
    }
  }

  async ngOnInit(): Promise<void> {
    await appWindow.listen<RunLog>('println', (data) => {
      const res = data.payload;
      this.setAMsg(res.msg);
      if(res.logType === "result") {
         this.running = false;
         this.message = [...this.message];
         setTimeout(()=>{
           this.scrollViewport.scrollTo({bottom: 0, behavior: "smooth"});
         },10);
      }
    });

    fromEvent(window, "resize").pipe(throttleTime(1000), debounceTime(1000)).subscribe(() => {
      setTimeout(() => {
        this.scrollViewport.checkViewportSize();
      }, 10);
    })

    this.messageSrv.onMessage(message => {
      if (message.type === MqType.SPLIT) {
        setTimeout(() => {
          this.scrollViewport.checkViewportSize();
        }, 10);
      }
    });
  }


  xtermViewClick($event: MouseEvent) {

  }


  xtermChange($event: Event) {
    $event.preventDefault();
  }

  async play($event: MouseEvent) {
    this.message = []
    this.running = true;
    this.runClick.emit("run");
  }

  async clear($event: MouseEvent) {
    this.message = [];
  }


  async copyClick($event: MouseEvent) {
    const copyText = this.message.filter(x=>x.type === MessageType.A).map(x=>x.message).join("\n");
    await writeText(copyText);
    await message("复制成功");
  }

  scrollViewportChange($event: Event) {


  }
}
