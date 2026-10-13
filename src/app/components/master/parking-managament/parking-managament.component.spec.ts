import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParkingManagamentComponent } from './parking-managament.component';

describe('ParkingManagamentComponent', () => {
  let component: ParkingManagamentComponent;
  let fixture: ComponentFixture<ParkingManagamentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParkingManagamentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParkingManagamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
