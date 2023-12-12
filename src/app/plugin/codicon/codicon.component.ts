import { Component, EventEmitter, Input, Output, booleanAttribute, numberAttribute } from '@angular/core';

@Component({
  selector: 'app-codicon',
  templateUrl: './codicon.component.html',
  styleUrl: './codicon.component.css'
})
export class CodiconComponent {

  @Input({required: true}) iconName!: string;
  
  @Input() selected!: boolean;

  @Input() rotate!: number;

  @Input() fontSize: string = "20px";

  @Input({transform: booleanAttribute}) showBorder!: boolean;

  iconClick($event: MouseEvent) {
     
  }

}
