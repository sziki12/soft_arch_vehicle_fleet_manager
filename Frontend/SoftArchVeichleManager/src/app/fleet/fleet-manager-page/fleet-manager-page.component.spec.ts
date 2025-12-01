import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FleetManagerPageComponent } from './fleet-manager-page.component';

describe('FleetManagerPageComponent', () => {
  let component: FleetManagerPageComponent;
  let fixture: ComponentFixture<FleetManagerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FleetManagerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FleetManagerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
