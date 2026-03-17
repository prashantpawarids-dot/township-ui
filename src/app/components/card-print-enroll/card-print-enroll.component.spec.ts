import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPrintEnrollComponent } from './card-print-enroll.component';

describe('CardPrintEnrollComponent', () => {
  let component: CardPrintEnrollComponent;
  let fixture: ComponentFixture<CardPrintEnrollComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPrintEnrollComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPrintEnrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
