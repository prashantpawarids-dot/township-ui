import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TownAddAccessRightsComponent } from './town-add-access-rights.component';

describe('TownAddAccessRightsComponent', () => {
  let component: TownAddAccessRightsComponent;
  let fixture: ComponentFixture<TownAddAccessRightsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TownAddAccessRightsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TownAddAccessRightsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
