import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { MonacoEditorComponent } from './plugin/monaco-editor/monaco-editor.component';
import { MonacoEditorModule } from "ngx-monaco-editor";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputNoSpaceDirective } from "./directive/input-no-space.directive";
import { AngularSplitModule } from 'angular-split';
import { TerminalComponent } from "./plugin/terminal/terminal.component";
import { XlsEditorComponent } from "./view/xls-editor/xls-editor.component";
import { MessageService } from "./service/message.service";
import { MenuComponent } from "./plugin/menu/menu.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { CodiconComponent } from "./plugin/codicon/codicon.component";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { DialogComponent } from "./plugin/dialog/dialog.component";
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CdkContextMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { ScrollingModule } from '@angular/cdk/scrolling'
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  declarations: [AppComponent, MonacoEditorComponent, TerminalComponent, XlsEditorComponent, MenuComponent, CodiconComponent, DialogComponent],
  imports: [BrowserModule, MonacoEditorModule.forRoot(), FormsModule, InputNoSpaceDirective, FormsModule, AngularSplitModule, BrowserAnimationsModule, FontAwesomeModule, DragDropModule, ReactiveFormsModule, CdkContextMenuTrigger, CdkMenu, CdkMenuItem, OverlayModule, ScrollingModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  providers: [MessageService],
  bootstrap: [AppComponent],
})
export class AppModule { }
