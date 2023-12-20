import { animate, sequence, state, style, transition, trigger } from '@angular/animations';
import { AfterViewChecked, AfterViewInit, Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
  animations:[
    trigger('openClose', [
      state('true', style({
        opacity: 1,
      })),
      state('false', style({
        opacity: 0,
        display: "none" 
      })),
      transition("false=>true",[
        sequence([
          style({display:"block", opacity: 0.1}),
          animate(500, style({opacity:1}))
        ])
      ]),
      transition('* => *', [
        animate('0.5s ease')
      ])
    ])
  ]
})
export class DialogComponent{

  
  @Input({required:true}) title!: string;

  @ViewChild("dialog") dialog!: ElementRef;

  protected visble: boolean = false;

  public close(){
    this.visble = false;
  }

  public show(){
    this.visble = true;
  }

  public setTitle(title:string){
    this.title = title;
  }

  @HostListener('click', ['$event.target'])
  onClick(target: HTMLElement): void {
    if (target.matches('.dialog-overlay')) {
      this.close();
    }
  }

  @HostListener('window:keydown', ['$event'])
  onEscape(event: KeyboardEvent): void {
    if (event.code === 'Escape') {
      this.close();
    }
  }



}
