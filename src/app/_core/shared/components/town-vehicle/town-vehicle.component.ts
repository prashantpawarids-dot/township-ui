import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { DomSanitizer } from '@angular/platform-browser';
import { Vehicle } from 'src/app/models/common.model';
import { AuthService } from 'src/app/services/auth.service';
@Component({
  selector: 'app-town-vehicle',
  imports: [CommonModule, MaterialModule, FormsModule],
  templateUrl: './town-vehicle.component.html',
  styleUrls: ['./town-vehicle.component.scss']
})
export class TownVehicleComponent {

  vehicleTypes: string[] = ['Two Wheeler', 'Four Wheeler', 'Three Wheeler'];

  statusOptions = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 }
  ];

  // @Input() vehicle: Vehicle;
    @Input() vehicle: Vehicle;
  nrdOptions: any[] = [];
  displayedColumnsVehicle: string[] = [
    'srno', 
    'vehicleType', 
    'vehicleRegNo', 
    'vehicleMake', 
    'vehicleColor', 
    'vehicleSticker', 
    'vehicleStatus', // Added Status column
    'actions'
  ];

  @Input() dataToDisplayVehicle;
  // @Input() dataSourceVehicle;
    @Input() dataSourceVehicle;
  @Input() isEmployee = false;
  @Output() vehicleEvent = new EventEmitter<{ action: 'add' | 'update' | 'delete', data: any }>();
  isUpdate: boolean;

  // constructor(private sanitizer: DomSanitizer) { }
    constructor(private sanitizer: DomSanitizer, private authService: AuthService) {
    this.authService.getNeighbourhood().subscribe((res: any) => {
      this.nrdOptions = res;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.dataToDisplayVehicle && this.dataSourceVehicle) {
      this.dataToDisplayVehicle.forEach((data, index) => {
        data.srno = (index + 1).toString();
      });
      this.dataSourceVehicle.setData(this.dataToDisplayVehicle);
    }
  }

  addUpdateVehicleData() {
    if (this.isUpdate) {
      this.vehicleEvent.emit({ action: 'update', data: this.vehicle });
      this.vehicle = new Vehicle(); // No default status
      this.isUpdate = false;
    } else {
      this.vehicleEvent.emit({ action: 'add', data: this.vehicle });
      this.vehicle = new Vehicle(); // No default status
    }
  }

  // editVehicleData(data: Vehicle) {
  //   this.vehicle = { ...data }; // Copies current selected status
  //   this.isUpdate = true;
  // }


    editVehicleData(data: Vehicle) {
    this.vehicle = { ...data, nrdIDs: [] }; // Copies current selected status
    this.isUpdate = true;

    if (this.isEmployee && data.id) {
      this.authService.getVehicleNRDs(Number(data.id)).subscribe({
        next: (res: any) => {
          this.vehicle.nrdIDs = res || [];
        },
        error: (err) => {
          console.log(err);
        }
      });
    }
  }

  removeVehicleData(data: Vehicle) {
    this.vehicleEvent.emit({ action: 'delete', data: data });
    this.vehicle = new Vehicle(); // No default status
  }
}
