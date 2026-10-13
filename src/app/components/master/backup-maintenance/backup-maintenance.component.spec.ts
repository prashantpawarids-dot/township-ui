import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BackupMaintenanceComponent } from './backup-maintenance.component';

describe('BackupMaintenanceComponent', () => {
  let component: BackupMaintenanceComponent;
  let fixture: ComponentFixture<BackupMaintenanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BackupMaintenanceComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BackupMaintenanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
