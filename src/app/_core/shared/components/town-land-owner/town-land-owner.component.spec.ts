import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TownLandOwnerComponent } from './town-land-owner.component';

describe('TownLandOwnerComponent', () => {
  let component: TownLandOwnerComponent;
  let fixture: ComponentFixture<TownLandOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TownLandOwnerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TownLandOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
