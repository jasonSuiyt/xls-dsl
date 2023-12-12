import { AfterViewInit, Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IOutputData, SplitAreaDirective, SplitComponent } from 'angular-split';
import { MqType } from 'src/app/enums/mq-type';
import { FileInfo } from 'src/app/modal/file-info';
import { DialogComponent } from 'src/app/plugin/dialog/dialog.component';
import { MonacoEditorComponent } from 'src/app/plugin/monaco-editor/monaco-editor.component';
import { MessageService } from 'src/app/service/message.service';
import { open, ask } from '@tauri-apps/api/dialog';
import { animate, sequence, state, style, transition, trigger } from '@angular/animations';




@Component({
  selector: 'app-xls-editor',
  templateUrl: './xls-editor.component.html',
  styleUrl: './xls-editor.component.css',
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
export class XlsEditorComponent implements AfterViewInit {



  @ViewChild("splitEl") splitEl!: SplitComponent;
  @ViewChild("splitPEl") splitPEl!: SplitComponent;
  @ViewChildren(SplitAreaDirective) areasEl!: QueryList<SplitAreaDirective>
  @ViewChild("monacoEditor") monacoEditor!: MonacoEditorComponent;
  @ViewChild("fileDialog") fileDialog!: DialogComponent;
  @ViewChild("fileContentMenu") fileContentMenu!: ElementRef;

  @ViewChildren("fileItem") fileItem!: QueryList<ElementRef>

  menuShow: boolean = false;

  fileList = Array<FileInfo>();

  fileForm = new FormGroup({
    fileName: new FormControl('', [Validators.required, Validators.minLength(4)]),
    xlsTemplate: new FormControl('', [Validators.required]),
  });
  selectedFile!: FileInfo;


  constructor(public messageSrv: MessageService) {
    this.fileList.push({
      id: 1,
      name: 'xls-editor',
      content: 'function x1() {\n   console.log("Hello world!");\n}',
      createDate: new Date(),
      updateDate: new Date(),
      xlsTemplate: ''
    });
    this.fileList.push({
      id: 2,
      name: 'xls-editor',
      content: 'function x2() {\n   console.log("Hello world!");\n}',
      createDate: new Date(),
      updateDate: new Date(),
      xlsTemplate: ''
    });
    this.fileList.push({
      id: 3,
      name: 'xls-editor',
      content: 'function x3() {\n   console.log("Hello world!");\n}',
      createDate: new Date(),
      updateDate: new Date(),
      xlsTemplate: ''
    });
  }

  ngAfterViewInit(): void {

    this.splitEl.dragProgress$.subscribe(x => {
      this.messageSrv.send({
        type: MqType.SPLIT
      })
    });

    this.splitPEl.dragProgress$.subscribe(x => {
      this.messageSrv.send({
        type: MqType.SPLIT
      })
    });

    this.messageSrv.onMessage(x => {

      switch (x.type) {
        case MqType.LEFT_FOLD:
          this.areasEl.first.expand();
          this.monacoEditor.onResize();
          this.splitPEl.disabled = false;
          break;
        case MqType.LEFT_FOLD_OFF:
          this.areasEl.first.collapse(0, 'left');
          this.monacoEditor.onResize();
          this.splitPEl.disabled = true;
          break;
        case MqType.BOTTOM_FOLD:
          this.areasEl.last.expand();
          this.monacoEditor.onResize();
          this.splitEl.disabled = false;
          break;
        case MqType.BOTTOM_FOLD_OFF:
          this.areasEl.last.collapse(0, 'left');
          this.monacoEditor.onResize();
          this.splitEl.disabled = true;
          break;
        default:
      }


    })
  }
  dragEnd($event: IOutputData) {

  }



  refresh($event: MouseEvent) {

  }

  addFile($event: MouseEvent) {
    console.log('addFile');
    this.fileDialog.show();
    this.fileDialog.setTitle('新增');
  }

  editFile($event: MouseEvent) {
    console.log('addFile');
    this.fileForm.patchValue({
      fileName: this.selectedFile.name,
      xlsTemplate: this.selectedFile.xlsTemplate
    })
    this.fileDialog.show();
    this.fileDialog.setTitle('修改');
  }

  async delFile($event: MouseEvent) {
    const yes: boolean = await ask('你确定删除?',  { title: '系统提示', type: 'warning' });
    if (yes){
      const index =  this.fileList.indexOf(this.selectedFile, 0);
      if (index > -1) {
        this.fileList.splice(index, 1);
     }
    }
  }



  saveCick($event: MouseEvent) {
    const fileForm = this.fileForm.value

    this.fileList.push({
      name: fileForm.fileName as string,
      xlsTemplate: fileForm.xlsTemplate as string,
    });

    this.fileDialog.close();
    this.fileForm.reset();
  }

  async selectFileClick($event: MouseEvent) {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'xlsx',
        extensions: ['xlsx']
      }]
    });
    if (selected) {
      this.fileForm.patchValue({
        xlsTemplate: selected as string
      })
    }
  }

  fileClick($event: MouseEvent, filInfo: FileInfo) {
    filInfo.selected = true;
    this.fileList.forEach(x => {
      if (x != filInfo) {
        x.selected = false;
      }
    })
    this.monacoEditor.setVal(filInfo.content as string);
  }

  fileContextmenu(event: MouseEvent, filInfo: FileInfo) {
    filInfo.selected = true;
    this.selectedFile = filInfo;
    this.fileList.forEach(x => {
      if (x != filInfo) {
        x.selected = false;
      }
    })
    event.preventDefault();
    this.menuShow = true;
    const menu = this.fileContentMenu.nativeElement as HTMLElement;
    menu.style.left = event.pageX + 'px';
    menu.style.top = event.pageY + 'px';
  }

  @HostListener('document:click', ['$event'])
  clickout() {
    this.menuShow = false;
  }

}
