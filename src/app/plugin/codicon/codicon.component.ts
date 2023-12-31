import {booleanAttribute, Component, Input} from '@angular/core';

@Component({
  selector: 'app-codicon',
  templateUrl: './codicon.component.html',
  styleUrl: './codicon.component.css'
})
export class CodiconComponent {

  @Input({required: true}) iconName!: string;
  
  @Input() selected!: boolean;

  @Input() rotate!: number;

  @Input() color!: string;

  @Input() tips!: string;

  @Input() darkColor!: string;

  @Input() fontSize: string = "20px";

  @Input({transform: booleanAttribute}) showBorder!: boolean;

  iconClick($event: MouseEvent) {
     
  }

}
