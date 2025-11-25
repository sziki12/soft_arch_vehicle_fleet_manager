import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModuleManagerPageComponent } from './module-manager-page.component';

describe('ModuleManagerPageComponent', () => {
  let component: ModuleManagerPageComponent;
  let fixture: ComponentFixture<ModuleManagerPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModuleManagerPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModuleManagerPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
