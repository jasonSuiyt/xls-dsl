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
  CdkVirtualScrollViewport,
  VirtualScrollStrategy
} from "@angular/cdk/scrolling";


@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.css'
})
export class TerminalComponent implements OnInit {

  running: boolean = false;

  @ViewChild("xterm") xterm!: ElementRef;

  @ViewChild("xtermView") xtermView!: ElementRef;

  @Output()
  runClick: EventEmitter<String> = new EventEmitter();

  @ViewChild("content") content!: ElementRef;

  @ViewChild("scrollViewport") scrollViewport!: CdkVirtualScrollViewport;


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
