import {  AfterViewInit, Component, HostListener, ViewChild } from "@angular/core";
import { invoke } from "@tauri-apps/api/tauri";
import { MessageService } from "./service/message.service";
import { SplitComponent } from "angular-split";
import { MqType } from "./enums/mq-type";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {

  greetingMessage = "";

  leftFold: boolean = false;

  bottomFold: boolean = false;


  constructor(public messageSrv: MessageService){}

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<string>("greet", { name }).then(text=> {
      this.greetingMessage = text;
    });
  }


  lPanelClick($event: MouseEvent){  
    this.leftFold = !this.leftFold;
    this.messageSrv.send({
      type: this.leftFold === true? MqType.LEFT_FOLD_OFF: MqType.LEFT_FOLD
    })
  }

  bPanelClick($event: MouseEvent){
    this.bottomFold = !this.bottomFold;
    this.messageSrv.send({
      type: this.bottomFold === true? MqType.BOTTOM_FOLD_OFF: MqType.BOTTOM_FOLD
    })
  }

  @HostListener('document:contextmenu', ['$event'])
  documentClick(event: MouseEvent){    
    event.preventDefault();
  }
}
