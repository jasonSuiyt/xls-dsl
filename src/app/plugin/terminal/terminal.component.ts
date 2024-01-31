import {ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild} from '@angular/core';
import {appWindow} from "@tauri-apps/api/window";
import {writeText} from '@tauri-apps/api/clipboard';
import {message} from '@tauri-apps/api/dialog';
import {RunLog} from 'src/app/modal/run-log';
import {CdkVirtualScrollViewport} from "@angular/cdk/scrolling";
import {debounceTime, fromEvent, Subject, throttleTime} from "rxjs";
import {MqType} from "../../enums/mq-type";
import {MessageService} from "../../service/message.service";
import  {v4 as uuidv4} from "uuid"

@Component({
  selector: 'app-terminal',
  templateUrl: './terminal.component.html',
  styleUrl: './terminal.component.css',
})
export class TerminalComponent implements OnInit {

  public running: boolean = false;

  @ViewChild("xterm") xterm!: ElementRef;

  @ViewChild("xtermView") xtermView!: ElementRef;


  @Output()
  runClick: EventEmitter<String> = new EventEmitter();

  @ViewChild("content") content!: ElementRef;

  @ViewChild(CdkVirtualScrollViewport, { static: true }) scrollViewport!: CdkVirtualScrollViewport;

  logSubject = new Subject<string>();


  constructor(public messageSrv: MessageService, public changeDetectorRef:ChangeDetectorRef) { }


  message = Array<RunLog>();

  async setAMsg(msg: RunLog) {
    msg.msg.split(/[\n\r]/).forEach(x=>{
      this.message.push({
        logType: msg.logType,
        msg:x
      });
    });
    //this.logSubject.next(uuidv4().toString())
  }


  async ngOnInit(): Promise<void> {
    await appWindow.listen<RunLog>('println', (data) => {
      const res = data.payload;
      if(res.logType !== "result"){
        this.setAMsg(res);
      }
      if(res.logType === "result" || res.logType === "error") {
         this.running = false;
         this.logSubject.next(uuidv4().toString())
         this.message = [...this.message];
         this.changeDetectorRef.detectChanges();
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
    // this.logSubject.subscribe(x=>{
    //   this.message = [...this.message];
    //   setTimeout(()=>{
    //     this.scrollViewport.scrollTo({bottom: 0, behavior: "smooth"});
    //   },10);
    // })
  }

  xtermViewClick($event: MouseEvent) {
  }


  xtermChange($event: Event) {
    $event.preventDefault();
  }

  async play($event: MouseEvent) {
    await this.clear($event);
    this.running = true;
    this.runClick.emit("run");
  }

  async clear($event: MouseEvent) {
    this.message = [];
  }


  async copyClick($event: MouseEvent) {
    const copyText = this.message.map(x=>x.msg).join("\n");
    await writeText(copyText);
    await message("复制成功");
  }

  scrollViewportChange($event: Event) {


  }
}
