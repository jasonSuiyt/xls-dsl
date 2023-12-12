import { AfterViewChecked, AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { IOutputData, SplitComponent } from 'angular-split';
import { EditorComponent, NgxEditorModel } from 'ngx-monaco-editor';
import { MessageType } from 'src/app/enums/message-type';
import { MqType } from 'src/app/enums/mq-type';
import { Message } from 'src/app/modal/message';
import { MessageService } from 'src/app/service/message.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-monaco-editor',
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.css']
})
export class MonacoEditorComponent implements OnInit, AfterViewInit {



  editorOptions = { theme: 'vs-light', language: 'javascript', fontSize: 14, layout: true,  locale: "zh-cn" };
  code: string = 'function x() {\n   console.log("Hello world!");\n}';
 
  @ViewChild("xtermView") xtermView!: ElementRef;

  @ViewChild("ngxMonacoEditor") ngxMonacoEditor!: EditorComponent;

  @ViewChild("topView") topView!: ElementRef;

  @ViewChild("splitView") splitView!: ElementRef;

  editor: any;

  constructor(public messageSrv: MessageService){}

 
  onInit(editor: any) {
    this.editor = editor;
  }

  ngAfterViewInit(): void {
    const editor = this.ngxMonacoEditor._editorContainer.nativeElement;
    editor.style.height = this.topView.nativeElement.clientHeight + 'px';

    const themeMedia = window.matchMedia("(prefers-color-scheme: light)");
    if (themeMedia.matches) {
      this.ngxMonacoEditor.options = { ...this.editorOptions, theme: 'vs-light' };
    } else {
      this.ngxMonacoEditor.options = { ...this.editorOptions, theme: 'vs-dark' };
    }
    themeMedia.addEventListener("change", e => {
      if (e.matches) {
        this.ngxMonacoEditor.options = { ...this.editorOptions, theme: 'vs-light' };
      } else {
        this.ngxMonacoEditor.options = { ...this.editorOptions, theme: 'vs-dark' };
      }
    });
    this.messageSrv.onMessage(message => {
        if (message.type === MqType.SPLIT){
          this.onResize();
        }
    });
  }

  @HostListener('window:resize')
  public onResize() {
    const editor = this.ngxMonacoEditor._editorContainer.nativeElement;
    editor.style.height = this.topView.nativeElement.clientHeight + 'px';
    this.editor.layout();
  }

  ngOnInit(): void {

  }

  public setVal(val: string): void {
    this.ngxMonacoEditor.writeValue(val);
  }

 

 
  
 
}
