import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InterfaceManagerPageComponent } from './interface-manager-page.component';

describe('InterfaceManagerPageComponent', () => {
  let component: InterfaceManagerPageComponent;
  let fixture: ComponentFixture<InterfaceManagerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InterfaceManagerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InterfaceManagerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
