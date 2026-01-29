import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiverViewCityEmployeeComponent } from './river-view-city-employee.component';

describe('RiverViewCityEmployeeComponent', () => {
  let component: RiverViewCityEmployeeComponent;
  let fixture: ComponentFixture<RiverViewCityEmployeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiverViewCityEmployeeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiverViewCityEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
