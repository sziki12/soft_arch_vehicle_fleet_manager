import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceFormComponent } from './interface-form.component';

describe('InterfaceFormComponent', () => {
  let component: InterfaceFormComponent;
  let fixture: ComponentFixture<InterfaceFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterfaceFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterfaceFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
