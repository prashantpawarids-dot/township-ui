import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardEncodingLogComponent } from './card-encoding-log.component';

describe('CardEncodingLogComponent', () => {
  let component: CardEncodingLogComponent;
  let fixture: ComponentFixture<CardEncodingLogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardEncodingLogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CardEncodingLogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
