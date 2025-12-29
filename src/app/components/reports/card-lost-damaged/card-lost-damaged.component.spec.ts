import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardLostDamagedComponent } from './card-lost-damaged.component';

describe('CardLostDamagedComponent', () => {
  let component: CardLostDamagedComponent;
  let fixture: ComponentFixture<CardLostDamagedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardLostDamagedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardLostDamagedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
