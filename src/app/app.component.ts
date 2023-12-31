import {Component, HostListener} from "@angular/core";
import {invoke} from "@tauri-apps/api";
import {MessageService} from "./service/message.service";
import {MqType} from "./enums/mq-type";

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


  lPanelClick($event: MouseEvent){  
    this.leftFold = !this.leftFold;
    this.messageSrv.send({
      type: this.leftFold? MqType.LEFT_FOLD_OFF: MqType.LEFT_FOLD
    })
  }

  bPanelClick($event: MouseEvent){
    this.bottomFold = !this.bottomFold;
    this.messageSrv.send({
      type: this.bottomFold? MqType.BOTTOM_FOLD_OFF: MqType.BOTTOM_FOLD
    })
  }

  @HostListener('document:contextmenu', ['$event'])
  documentClick(event: MouseEvent){    
    event.preventDefault();
  }
}
