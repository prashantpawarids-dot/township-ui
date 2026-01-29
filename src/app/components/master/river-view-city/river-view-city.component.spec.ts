import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiverViewCityComponent } from './river-view-city.component';

describe('RiverViewCityComponent', () => {
  let component: RiverViewCityComponent;
  let fixture: ComponentFixture<RiverViewCityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiverViewCityComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RiverViewCityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
