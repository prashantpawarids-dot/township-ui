import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleRegisterInOutComponent } from './vehicle-register-in-out.component';

describe('VehicleRegisterInOutComponent', () => {
  let component: VehicleRegisterInOutComponent;
  let fixture: ComponentFixture<VehicleRegisterInOutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VehicleRegisterInOutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VehicleRegisterInOutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
