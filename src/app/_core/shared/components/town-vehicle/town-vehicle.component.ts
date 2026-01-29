// import { CommonModule } from '@angular/common';
// import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { MaterialModule } from '../../material/material.module';
// import { DomSanitizer } from '@angular/platform-browser';
// import { Vehicle } from 'src/app/models/common.model';

// @Component({
//   selector: 'app-town-vehicle',
//   imports: [CommonModule, MaterialModule, FormsModule],
//   templateUrl: './town-vehicle.component.html',
//   styleUrl: './town-vehicle.component.scss'
// })
// export class TownVehicleComponent {

//   vehicleTypes: string[] = ['Two Wheeler', 'Four Wheeler', 'Three Wheeler'];

//   @Input() vehicle;
//   displayedColumnsVehicle: string[] = ['srno', 'vehicleType', 'vehicleRegNo', 'vehicleMake', 'vehicleColor', 'vehicleSticker', 'actions'];

//   @Input() dataToDisplayVehicle;
//   @Input() dataSourceVehicle;
//   @Output() vehicleEvent = new EventEmitter<{ action: 'add' | 'update' | 'delete', data: any }>();
//   isUpdate: boolean;

//   constructor(private sanitizer: DomSanitizer) {

//   }

//   ngOnChanges(changes: SimpleChanges): void {
//     console.log('dataToDisplay', this.dataToDisplayVehicle);
//     this.dataToDisplayVehicle.forEach((data, index) => {
//       data.srno = (index + 1).toString();
//     });
//     this.dataSourceVehicle.setData(this.dataToDisplayVehicle);

//   }

//   addUpdateVehicleData() {
//     if (this.isUpdate) {
//       this.vehicleEvent.emit({ action: 'update', data: this.vehicle });
//       this.vehicle = new Vehicle();
//       this.isUpdate = false;
//     } else {
//       this.vehicleEvent.emit({ action: 'add', data: this.vehicle });
//       this.vehicle = new Vehicle();
//     }
//     // locally add logic
//     // const srno = this.dataToDisplayVehicle.length + 1;
//     // this.vehicle.srno = srno.toString();
//     // this.dataToDisplayVehicle = [...this.dataToDisplayVehicle, this.vehicle];
//     // this.dataSourceVehicle.setData(this.dataToDisplayVehicle);
//     // this.vehicleEvent.emit(this.dataToDisplayVehicle)
//     // this.vehicle = new Vehicle();
//   }

//   editVehicleData(data) {
//     this.vehicle = data;
//     this.isUpdate = true;
//   }


//   removeVehicleData(data) {
//     this.vehicleEvent.emit({ action: 'delete', data: this.vehicle });
//     this.vehicle = new Vehicle();
//     // locally add logic
//     // this.dataToDisplayVehicle = this.dataToDisplayVehicle.filter(x => x.srno !== data.srno);
//     // this.dataSourceVehicle.setData(this.dataToDisplayVehicle);
//     // this.vehicleEvent.emit(this.dataToDisplayVehicle)
//   }
// }


//new code


import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { DomSanitizer } from '@angular/platform-browser';
import { Vehicle } from 'src/app/models/common.model';

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

  @Input() vehicle: Vehicle;
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
  @Input() dataSourceVehicle;
  @Output() vehicleEvent = new EventEmitter<{ action: 'add' | 'update' | 'delete', data: any }>();
  isUpdate: boolean;

  constructor(private sanitizer: DomSanitizer) { }

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

  editVehicleData(data: Vehicle) {
    this.vehicle = { ...data }; // Copies current selected status
    this.isUpdate = true;
  }

  removeVehicleData(data: Vehicle) {
    this.vehicleEvent.emit({ action: 'delete', data: data });
    this.vehicle = new Vehicle(); // No default status
  }
}
