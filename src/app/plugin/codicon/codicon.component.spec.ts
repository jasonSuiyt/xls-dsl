import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CodiconComponent } from './codicon.component';

describe('CodiconComponent', () => {
  let component: CodiconComponent;
  let fixture: ComponentFixture<CodiconComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodiconComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CodiconComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
