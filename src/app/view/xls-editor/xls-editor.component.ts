import {
    AfterViewInit,
    Component,
    ElementRef,
    HostListener,
    QueryList,
    ViewChild,
    ViewChildren,
    OnInit, inject
} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {IOutputData, SplitAreaDirective, SplitComponent} from 'angular-split';
import {MqType} from 'src/app/enums/mq-type';
import {FileInfo} from 'src/app/modal/file-info';
import {DialogComponent} from 'src/app/plugin/dialog/dialog.component';
import {MonacoEditorComponent} from 'src/app/plugin/monaco-editor/monaco-editor.component';
import {MessageService} from 'src/app/service/message.service';
import {open, ask} from '@tauri-apps/api/dialog';
import {animate, sequence, state, style, transition, trigger} from '@angular/animations';
import {invoke} from "@tauri-apps/api";


@Component({
    selector: 'app-xls-editor',
    templateUrl: './xls-editor.component.html',
    styleUrl: './xls-editor.component.css',
    animations: [
        trigger('openClose', [
            state('true', style({
                opacity: 1,
            })),
            state('false', style({
                opacity: 0,
                display: "none"
            })),
            transition("false=>true", [
                sequence([
                    style({display: "block", opacity: 0.1}),
                    animate(500, style({opacity: 1}))
                ])
            ]),
            transition('* => *', [
                animate('0.2s ease')
            ])
        ])
    ]
})
export class XlsEditorComponent implements AfterViewInit, OnInit {


    @ViewChild("splitEl") splitEl!: SplitComponent;
    @ViewChild("splitPEl") splitPEl!: SplitComponent;
    @ViewChildren(SplitAreaDirective) areasEl!: QueryList<SplitAreaDirective>
    @ViewChild("monacoEditor") monacoEditor!: MonacoEditorComponent;
    @ViewChild("fileDialog") fileDialog!: DialogComponent;
    @ViewChild("fileContentMenu") fileContentMenu!: ElementRef;

    @ViewChildren("fileItem") fileItem!: QueryList<ElementRef>

    menuShow: boolean = false;

    xlsId!: number;

    fileList = Array<FileInfo>();

    fileForm = new FormGroup({
        id: new FormControl(''),
        name: new FormControl('', [Validators.required, Validators.minLength(4)]),
        xlxTemplate: new FormControl('', [Validators.required]),
    });

    messageSrv = inject(MessageService)

    ngOnInit() {
        invoke<Array<FileInfo>>("find_all_file").then(res => {
            console.log(res);
            
            this.fileList = res;
        })
    }

    ngAfterViewInit(): void {

        this.messageSrv.onMessage(x => {
            switch (x.type) {
                case MqType.LEFT_FOLD:
                    this.areasEl.first.expand();
                    this.monacoEditor.fitEidtor();
                    this.splitPEl.disabled = false;
                    break;
                case MqType.LEFT_FOLD_OFF:
                    this.areasEl.first.collapse(0, 'left');
                    this.monacoEditor.fitEidtor();
                    this.splitPEl.disabled = true;
                    break;
                case MqType.BOTTOM_FOLD:
                    this.areasEl.last.expand();
                    this.monacoEditor.fitEidtor();
                    this.splitEl.disabled = false;
                    break;
                case MqType.BOTTOM_FOLD_OFF:
                    this.areasEl.last.collapse(0, 'left');
                    this.monacoEditor.fitEidtor();
                    this.splitEl.disabled = true;
                    break;
                default:
            }

        });
    }

    dragEnd($event: IOutputData) {
        this.messageSrv.send({
            type: MqType.SPLIT
        })
    }


    refresh($event: MouseEvent) {

    }

    addFile($event: MouseEvent) {
        this.fileDialog.show();
        this.fileForm.reset();
        this.fileDialog.setTitle('新增');
    }

    editFile($event: MouseEvent) {
        const selectedFile = this.fileList.filter(x=>x.selected)[0];
        this.fileForm.patchValue(selectedFile as any);
        this.fileDialog.show();
        this.fileDialog.setTitle('修改');
    }

    async delFile($event: MouseEvent) {
        const yes: boolean = await ask('你确定删除?', {title: '系统提示', type: 'warning'});
        if (yes) {
            const selectedFile = this.fileList.filter(x=>x.selected)[0];
            const res = await invoke<FileInfo>("remove_file", {id: selectedFile.id});
            const index = this.fileList.indexOf(selectedFile, 0);
            if (index > -1) {
                this.fileList.splice(index, 1);
            }
        }
    }

    async saveClick($event: MouseEvent) {
        const fileForm = this.fileForm.value
        if(fileForm.id){
            let add_form = {
                id : fileForm.id,
                name: fileForm.name as string,
                xls: fileForm.xlxTemplate as string
            }    
            const res = await invoke<FileInfo>("update_name_xls_by_id", {...add_form});
            this.fileList.forEach(x=>{
                if(x.id === fileForm.id){
                    x.name  = res.name;
                    x.xlxTemplate  = res.xlxTemplate;
                    x.code  = res.code;
                }
            })
        }else {
            let add_form = {
                name: fileForm.name as string,
                xlxTemplate: fileForm.xlxTemplate as string,
                code: ""
            }    
            const res = await invoke<FileInfo>("add_file", {newFile: add_form});
            this.fileList.push(res);
        }

       
        this.fileDialog.close();
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
                xlxTemplate: selected as string
            })
        }
    }

    fileClick($event: MouseEvent, filInfo: FileInfo) {
        filInfo.selected = true;
        this.xlsId = filInfo.id as number;
        this.fileList.forEach(x => {
            if (x != filInfo) {
                x.selected = false;
            }
        })
        //this.monacoEditor.setVal(filInfo.code as string);
    }

    fileContextmenu(event: MouseEvent, filInfo: FileInfo) {
        filInfo.selected = true;
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

    async runClick($event: String) {
       invoke('run', {id: this.fileList.filter(x=>x.selected)[0].id}).then(data=>{
            console.log(data);
       });  
    }

}
