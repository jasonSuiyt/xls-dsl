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

  logRes = Array<string>();

  xtermFocused = false;

  xtermValue: string = '';

  xtermViewML() {
    console.log("xtermViewML")
    this.xterm.nativeElement.blur();
    this.xtermFocused = false;
  }

  public setQMsg(msg: string) {
    const content = this.content.nativeElement as HTMLInputElement
    let div = document.createElement("pre");
    div.classList.add("pr-1.5");
    div.classList.add("text-green-500");
    div.innerHTML = "xls-parser:~$ " + msg
    content.append(div);
  }

  public setAMsg(msg: string) {
    const content = this.content.nativeElement as HTMLInputElement;
    if (content) {
      const divs = content.getElementsByTagName("pre");
      if(divs.length > 1500){
        content.removeChild(divs[0]);
      }
    }
 
    let div = document.createElement("pre");
    div.classList.add("text-black");
    div.classList.add("dark:text-white");
    div.innerHTML = msg;
    content.append(div);
  }

  async ngOnInit(): Promise<void> {
    await appWindow.listen<RunLog>('println', (data) => {
      const res = data.payload;
      this.setAMsg(res.msg);
      this.logRes.push(res.msg);
      if(res.logType === "result") {
          this.running = false;
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

  play($event: MouseEvent) {
    this.running = true;
    this.setQMsg("run");
    this.runClick.emit("run");
    this.logRes = [];
    setTimeout(()=>{
      this.running = false;
    },10000)
  }

  clear($event: MouseEvent) {
    this.setQMsg("clear");
    const content = this.content.nativeElement as HTMLInputElement;
    content.innerHTML = "";
  }


  xtermKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 13) {

      this.setQMsg(this.xtermValue);
      switch (this.xtermValue) {
        case "help":
          this.setAMsg("run&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;运行代码");
          this.setAMsg("clear&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;清屏")
          break
        case "clear":
          const content = this.content.nativeElement as HTMLInputElement;
          content.innerHTML = "";
          break
        case "run":
          this.logRes = [];
          this.runClick.emit("run");
          break
        default:
          this.setAMsg('不支持此命令');
      }
      this.xtermValue = '';
    }
  }


  async copyClick($event: MouseEvent) {
    const copyText = this.logRes.join("\n");
    await writeText(copyText);
    await message("复制成功");
  }

}
