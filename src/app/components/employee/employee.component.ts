import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, EMPTY, from } from 'rxjs';
import { TownAddAccessRightsComponent } from 'src/app/_core/shared/components/town-add-access-rights/town-add-access-rights.component';
import { TownLandOwnerComponent } from 'src/app/_core/shared/components/town-land-owner/town-land-owner.component';
import { TownVehicleComponent } from 'src/app/_core/shared/components/town-vehicle/town-vehicle.component';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import {Vehicle, AddonDataSource, AdditionalAccessRightsData, Employee} from 'src/app/models/common.model';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
@Component({
  selector: 'app-employee',
  imports: [CommonModule, MaterialModule, FormsModule,
      TownLandOwnerComponent, TownVehicleComponent, TownAddAccessRightsComponent],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.scss'
})
export class EmployeeComponent implements OnInit, OnDestroy  {

  constructor(private authService: AuthService,
    private cd: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }
  // employee
  employee: Employee = new Employee();
  // vehicle
  vehicle = new Vehicle();
  vehicleList: Vehicle[] = [];
  dataSourceVehicle = new AddonDataSource(this.vehicleList);
  // add access rights
  addAccessRights = new AdditionalAccessRightsData();
  dataToDisplayAAR: AdditionalAccessRightsData[] = [];
  dataSourceAAR = new AddonDataSource(this.dataToDisplayAAR);
  isViewOrEdit: boolean = false;
  

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isViewOrEdit = true;
        this.getEmployeeById((Number)(id));

      } else {
        this.isViewOrEdit = false;
      }
    });

  }

  // employee
  getEmployeeById(id: number) {
    this.authService.getEmployeeById(id).subscribe({
      next: (res) => {
        this.employee = res.owners[0];
        this.vehicleList = res.vehicles;
        this.dataToDisplayAAR = res.userAllAccess;
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  // vehicle
  updateVehicleTable(event) {
    if (event.action === 'delete') {
      this.deleteVehicle(event.data);
    } else if (event.action === 'update') {
      this.updateVehicle(event.data);
    } else if (event.action === 'add') {
      this.addVehicle(event.data);
    }
  }

  addVehicle(vehicle: Vehicle) {
    vehicle['tagUID'] = this.employee.idNumber;
    this.authService.postLandOwnerVehicle(vehicle).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Vehicle added successfully');
        this.getEmployeeById(Number(this.employee.id));
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  updateVehicle(vehicle: Vehicle) {
    this.authService.updateLandOwnerVehicle(vehicle).subscribe({
      next: (res) => {
        console.log("Vehicle updated successfully", res);
        this.alertService.openSuccess('Vehicle updated successfully');
        this.getEmployeeById(Number(this.employee.id));
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  deleteVehicle(vehicle: Vehicle) {
    vehicle['logicalDeleted'] = '1';
    this.authService.updateLandOwnerVehicle(vehicle).subscribe({
      next: (res) => {
        console.log("Vehicle deleted successfully", res);
        this.alertService.openSuccess('Vehicle deleted successfully');
        this.getEmployeeById(Number(this.employee.id));
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  // Additional Access Rights
  updateAARTable(event) {
    if (event.action === 'delete') {
      this.deleteAccessRights(event.data);
    } else if (event.action === 'update') {
      this.postAccessRights(event.data);
    } else if (event.action === 'add') {
      this.postAccessRights(event.data);
    }
  }

  postAccessRights(accessRights: any) {
    from(accessRights).pipe(
      concatMap((accessRight: AdditionalAccessRightsData) =>
        {
          accessRight.cardHolderID = this.employee.idNumber.toString();
          return this.authService.postLandOwnerAccessRights([accessRight]).pipe(
            catchError((err) => {
              this.errorHandlerService.handleError(err);
              this.cd.detectChanges();
              return EMPTY; // Continue with the next accessRight even if an error occurs
            })
          )
        }
      )
    ).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access right added successfully');
        this.getEmployeeById(Number(this.employee.id));
      },
      error: (err) => {
      }
    });
  }

  updateAccessRights(accessRights: AdditionalAccessRightsData) {
    accessRights.cardHolderID = this.employee.code;
    this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access rights updated successfully');
        this.getEmployeeById(Number(this.employee.id));
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  deleteAccessRights(accessRights: AdditionalAccessRightsData) {
    accessRights['logicalDeleted'] = '1';
    this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access rights deleted successfully');
        this.getEmployeeById(Number(this.employee.id));
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }
  // Save Form

  saveEmployee() {
    this.employee.createdon = new Date().toISOString();
    this.employee.updatedon = new Date().toISOString();
    this.employee.mobileNo = this.employee.mobileNo.toString();
    this.employee.isactive = 1;
    this.employee.id = 0;
     this.employee.idNumber = this.employee.idNumber;
    this.authService.postEmployee(this.employee).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Saved');
        setTimeout(() => {
          this.cancel();
        }, 2000);
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  updateEmployee() {
    this.employee.updatedon = new Date().toISOString();
    this.employee.mobileNo = this.employee.mobileNo.toString();
    this.authService.updateEmployee(this.employee).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Saved');
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  cancel() {
    this.employee = new Employee();
    this.authService.setLandOwnerData(this.employee, false);
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/employee' }
    });
  }

  ngOnDestroy(): void {
    this.employee = new Employee();
    this.authService.setLandOwnerData(this.employee, false);
  }
}
