import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardRevokeBlockComponent } from './card-revoke-block.component';

describe('CardRevokeBlockComponent', () => {
  let component: CardRevokeBlockComponent;
  let fixture: ComponentFixture<CardRevokeBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardRevokeBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardRevokeBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
