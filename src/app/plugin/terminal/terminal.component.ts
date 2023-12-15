import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, inject, signal } from '@angular/core';
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

  @ViewChild("xtermView") xtermView!: ElementRef;

  @Output()
  runClick: EventEmitter<String> = new EventEmitter();
  changeDetectorRef = inject(ChangeDetectorRef);

  @ViewChild("content") content!: ElementRef;

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
    const content = this.content.nativeElement as HTMLInputElement
      let div = document.createElement("div");
      div.classList.add("text-black");
      div.classList.add("dark:text-white");
      div.innerHTML = msg;
      content.append(div);
  }

  async ngOnInit(): Promise<void> {
    await appWindow.listen('println', (data) => {
      this.setAMsg(data.payload as string)
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
    this.setQMsg("run");
    this.runClick.emit("run");
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
          this.runClick.emit("run");
          break
        default:
          this.setAMsg('不支持此命令');
      }
      this.xtermValue = '';
    }
  }



}
