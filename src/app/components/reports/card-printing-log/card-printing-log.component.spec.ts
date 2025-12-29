import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPrintingLogComponent } from './card-printing-log.component';

describe('CardPrintingLogComponent', () => {
  let component: CardPrintingLogComponent;
  let fixture: ComponentFixture<CardPrintingLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardPrintingLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardPrintingLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
