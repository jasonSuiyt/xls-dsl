
import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {animate, state, style, transition, trigger} from "@angular/animations";
import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/api/notification';

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.css'],
    animations:[
        trigger('selectTag', [
            state('xlsEditor', style({
                top : '40px'
            })),
            state('debug', style({
                top : '96px'
            })),
          
            transition('* => *', [
                animate(100)
            ]),
            // transition('debug => *', [
            //     animate(500)
            // ]),
        ])
    ]
})
export class MenuComponent implements OnInit {

   
    ngOnInit(): void {

    }

    @Output()
    menuClick: EventEmitter<String> = new EventEmitter();

    menuSelected: string = 'xlsEditor';


    async onMenuClick(_: MouseEvent, url: string) {
        this.menuSelected = url;
        // await this.router.navigate([url]);
        //this.menuClick.emit(url);
    }

    async refreshClick($event: MouseEvent) {
        const refresh_icon = $event.target as HTMLOrSVGImageElement
        refresh_icon.classList.add('animate-spin');
        if(this.menuSelected == 'bing') {
            //await invoke("refresh", {source: 'bing'});
        } else if (this.menuSelected == 'microsoft') {
            //await invoke("refresh", {source: 'spotlight'});
        } else {
           // await invoke("refresh", {source: 'wallpapers'});
        }
        refresh_icon.classList.remove('animate-spin');

        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
        }
        if (permissionGranted) {
            sendNotification({ title: '壁纸天堂', body: '壁纸更新完成' });
        }
    }

}
