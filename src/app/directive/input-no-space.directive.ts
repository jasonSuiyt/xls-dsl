import { Directive, ElementRef, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[input-no-space]',
  standalone: true
})
export class InputNoSpaceDirective {

  constructor(private elementRef: ElementRef) {
  }

  //禁止输入空格，即当用户按下空格键时便阻止输入
  @HostListener('keydown', ['$event'])
  keydownFun($event: KeyboardEvent) {
    if ($event.key.trim() === '') {
      $event.preventDefault();
    }
  }

}
