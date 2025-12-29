import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TownVehicleComponent } from './town-vehicle.component';

describe('TownVehicleComponent', () => {
  let component: TownVehicleComponent;
  let fixture: ComponentFixture<TownVehicleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TownVehicleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TownVehicleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
