import {AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {invoke} from '@tauri-apps/api';
import {EditorComponent} from 'ngx-monaco-editor';
import {MqType} from 'src/app/enums/mq-type';
import {FileInfo} from 'src/app/modal/file-info';
import {MessageService} from 'src/app/service/message.service';
import {debounceTime, fromEvent, throttleTime} from 'rxjs';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-monaco-editor',
  templateUrl: './monaco-editor.component.html',
  styleUrls: ['./monaco-editor.component.css']
})
export class MonacoEditorComponent implements OnInit, AfterViewInit {



  code!: string;

  select_id: number = 0;

  @Input({ required: true }) set id(value: number) {
    this.select_id = value;
    if (value) {
      invoke<FileInfo>('get_by_id', { id: value }).then(file => {
        this.setVal(file.code as string);
      })
    }
  }

  editorOptions = {
    theme: 'vs-light',
    language: 'javascript',
    fontSize: 14,
    layout: true,
    locale: "zh-cn",
    scrollbar: {
      useShadows: true,
      verticalHasArrows: false,
      horizontalHasArrows: false,
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
      arrowSize: 10,
    },
  };


  @ViewChild("xtermView") xtermView!: ElementRef;

  @ViewChild("ngxMonacoEditor") ngxMonacoEditor!: EditorComponent;

  @ViewChild("topView") topView!: ElementRef;

  @ViewChild("splitView") splitView!: ElementRef;

  editor: any;

  constructor(public messageSrv: MessageService) { }



  onInit(editor: any) {
    this.editor = editor;
    const monaco = (window as any).monaco;
    monaco.languages.registerCompletionItemProvider('javascript', {
      triggerCharacters: ['.'],
      provideCompletionItems: function (model: any, position: any, context: any, token: any) {

        const line = position.lineNumber
        const content = model.getLineContent(line).trim();
        let word = model.getWordUntilPosition(position);
        let preStr = content.substring(0,word.startColumn-1);
        if(preStr.endsWith(".")){
          if(preStr.endsWith("fs.")){
            const completionItemList = [
              {
                label: "create",
                insertText: "create(${1:file})",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: monaco.languages.CompletionItemKind.Function,
                detail: "创建文件",
                sortText: "1"
              },
              {
                label: "append",
                insertText: "append(${1:fileName},${2:str})",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: monaco.languages.CompletionItemKind.Function,
                detail: "对文件进行文本追加",
                sortText: "1"
              },
              {
                label: "read_xls",
                insertText: "read_xls(${1:fileName})",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                kind: monaco.languages.CompletionItemKind.Function,
                detail: "获取xls数据方法",
                sortText: "3"
              },
            ];

            return {
              suggestions: [...completionItemList]
            }
          }
        }

        const completionItemList = [
          {
            label: "uuid",
            insertText: "uuid()",
            kind:  monaco.languages.CompletionItemKind.Function,
            detail: "生成uuid方法",
            sortText: "1"
          },
          {
            label: "snowid",
            insertText: "snowid()",
            kind:  monaco.languages.CompletionItemKind.Function,
            detail: "生成雪花ID方法",
            sortText: "1"
          },
          {
            label: "md5",
            insertText: "md5(${1:})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            kind: monaco.languages.CompletionItemKind.Function,
            detail: "md5",
            sortText: "1",
          },
          {
            label: "println",
            insertText: "println(${1:})",
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            kind: monaco.languages.CompletionItemKind.Function,
            detail: "打印输出消息",
            sortText: "1",
          },
          {
            label: "fori",
            insertText: 'for(let i=0;i<${1:};i++){\n${2:}\n}',
            insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            detail: "fori",
            sortText: "1",
          },
          {
            label: "xlsName",
            insertText: 'xlsName',
            kind: monaco.languages.CompletionItemKind.Variable,
            detail: "文件名称",
            sortText: "1",
          }
        ];
        const suggestions = completionItemList.filter((x: any) =>  x.label.concat(word));
        return {
          suggestions: [...suggestions]
        }
      }
    })
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
      if (message.type === MqType.SPLIT) {
        this.fitEditor();
      }
    });

    fromEvent(window, "resize").pipe(throttleTime(1000), debounceTime(1000)).subscribe(() => {
      console.log(1111);

      this.fitEditor();
    })
  }


  public fitEditor() {
    const editor = this.ngxMonacoEditor._editorContainer.nativeElement;
    editor.style.height = this.topView.nativeElement.clientHeight + 'px';
    this.editor.layout();
  }

  ngOnInit(): void {

  }

  private setVal(val: string): void {
    this.ngxMonacoEditor.writeValue(val);
  }

  codeChange(value: string) {
    const params = { id: this.select_id, code: value };
    invoke<FileInfo>('update_code_by_id', { ...params }).then(_ => { })
  }



}
