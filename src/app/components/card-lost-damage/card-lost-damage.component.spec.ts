import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardLostDamageComponent } from './card-lost-damage.component';

describe('CardLostDamageComponent', () => {
  let component: CardLostDamageComponent;
  let fixture: ComponentFixture<CardLostDamageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardLostDamageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardLostDamageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
