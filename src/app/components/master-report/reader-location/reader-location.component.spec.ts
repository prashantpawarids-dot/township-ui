import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReaderLocationComponent } from './reader-location.component';

describe('ReaderLocationComponent', () => {
  let component: ReaderLocationComponent;
  let fixture: ComponentFixture<ReaderLocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReaderLocationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReaderLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
