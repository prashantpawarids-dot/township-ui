import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReaderRelayComponent } from './reader-relay.component';

describe('ReaderRelayComponent', () => {
  let component: ReaderRelayComponent;
  let fixture: ComponentFixture<ReaderRelayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReaderRelayComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReaderRelayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
