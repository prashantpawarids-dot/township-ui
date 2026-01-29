import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TownAddOnCardComponent } from './town-add-on-card.component';

describe('TownAddOnCardComponent', () => {
  let component: TownAddOnCardComponent;
  let fixture: ComponentFixture<TownAddOnCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TownAddOnCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TownAddOnCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
