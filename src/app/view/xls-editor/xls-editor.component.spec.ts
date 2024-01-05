import {ComponentFixture, TestBed} from '@angular/core/testing';

import {XlsEditorComponent} from './xls-editor.component';

describe('XlsEditorComponent', () => {
  let component: XlsEditorComponent;
  let fixture: ComponentFixture<XlsEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [XlsEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(XlsEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
