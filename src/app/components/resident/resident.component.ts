import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TownAddAccessRightsComponent } from 'src/app/_core/shared/components/town-add-access-rights/town-add-access-rights.component';
import { TownAddOnCardComponent } from 'src/app/_core/shared/components/town-add-on-card/town-add-on-card.component';
import { TownLandOwnerComponent } from 'src/app/_core/shared/components/town-land-owner/town-land-owner.component';
import { TownVehicleComponent } from 'src/app/_core/shared/components/town-vehicle/town-vehicle.component';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AddonCard, Vehicle, AdditionalAccessRightsData, AddonDataSource, Resident, LandOwner } from 'src/app/models/common.model';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { catchError, concatMap, EMPTY, from } from 'rxjs';
import { LandOwnerComponent } from '../land-owner/land-owner.component';

@Component({
  selector: 'app-resident',
  imports: [CommonModule, MaterialModule, FormsModule,
    TownLandOwnerComponent, TownAddOnCardComponent,
    TownVehicleComponent, TownAddAccessRightsComponent],
  templateUrl: './resident.component.html',
  styleUrl: './resident.component.scss'
})
export class ResidentComponent {

  // resident
  resident: Resident = new Resident();
  // add on card
  isViewOrEdit: boolean = false;
 
  addonCard = new AddonCard();
  addonCardList: AddonCard[] = [];
  dataSource = new AddonDataSource(this.addonCardList);
  // vehicle

  vehicle = new Vehicle();
  vehicleList: Vehicle[] = [];
  dataSourceVehicle = new AddonDataSource(this.vehicleList);
  // add access rights

  addAccessRights = new AdditionalAccessRightsData();
  dataToDisplayAAR: AdditionalAccessRightsData[] = [];
  dataSourceAAR = new AddonDataSource(this.dataToDisplayAAR);

  constructor(private authService: AuthService,
    private cd: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        // this.resident = data;
        this.isViewOrEdit = true;
        this.getResidentById((Number)(id));

      } else {
        this.isViewOrEdit = false;
      }
    });
  }
  // resident
  getResidentById(id: number) {
    this.authService.getResidentById(id).subscribe({
      next: (res) => {
        this.resident = res.owners[0];
        this.addonCardList = res.dependentOwners;
        this.vehicleList = res.vehicles;
        this.dataToDisplayAAR = res.userAllAccess;
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }
  uploadImage(selectedFile, idNumber) {
  //  this.resident.photo=selectedFile;
    this.authService.uploadImage(selectedFile, idNumber);
  }

  updateResident() {
    this.resident.shortName = this.resident.firstName + " " + this.resident.lastName;
       let photo= this.resident.photo;  
    delete this.resident.photo;
    this.authService.updateResident(this.resident).subscribe({
      next: (res) => {
         if (photo!=null  ) {
          this.uploadImage(photo, res.idNumber)
        }
        this.alertService.openSuccess('Successfully Saved');

      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
    this.addonCardList.forEach((element) => {
      element.pid = Number(this.resident.id);
      element.mobileNo = element.mobileNo.toString();
    });
  }


  setRequiredFields(addonCard) {
    addonCard.pid = Number(this.resident.id);
    addonCard.mobileNo = addonCard.mobileNo.toString();
    addonCard.logicalDeleted = 0;
    addonCard.building = this.resident.building;
    addonCard.nrd = this.resident.nrd;
  }

  // Add on card

  addAddOnTable(addonCard: any) {
    this.setRequiredFields(addonCard)
    this.authService.postResidentAddonCard(addonCard).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Saved');
        this.getResidentById(Number(this.resident.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  deleteAddOnTable(addonCard: any) {
    addonCard.mobileNo = addonCard.mobileNo.toString();
    addonCard['logicalDeleted'] = 1;
    this.authService.updateResidentAddonCard(addonCard).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Deleted');
        this.getResidentById(Number(this.resident.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }
  updateAddOnTable(addonCard: any) {
    this.setRequiredFields(addonCard)
    this.authService.updateResidentAddonCard(addonCard).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Updated');
        this.getResidentById(Number(this.resident.id));
      },
      error: (err: any) => {
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
    vehicle['tagUID'] = this.resident.idNumber;
    this.authService.postLandOwnerVehicle(vehicle).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Vehicle added successfully');
        this.getResidentById(Number(this.resident.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  updateVehicle(vehicle: Vehicle) {
    this.authService.updateLandOwnerVehicle(vehicle).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Vehicle updated successfully');
        this.getResidentById(Number(this.resident.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  deleteVehicle(vehicle: Vehicle) {
    vehicle['logicalDeleted'] = '1';
    this.authService.updateLandOwnerVehicle(vehicle).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Vehicle deleted successfully');
        this.getResidentById(Number(this.resident.id));
      },
      error: (err: any) => {
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
          accessRight.cardHolderID = this.resident.idNumber
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
        this.getResidentById(Number(this.resident.id));
      },
      error: (err) => {
      }
    });
  }

  updateAccessRights(accessRights: AdditionalAccessRightsData) {
    accessRights[0].cardHolderID = this.resident.idNumber;
    this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access rights updated successfully');
        this.getResidentById(Number(this.resident.id));
      },
      error: (err: any) => {
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
        this.getResidentById(Number(this.resident.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }
  // Save Form

  saveResident() {
    this.resident.shortName = this.resident.firstName + " " + this.resident.lastName;
    let photo = this.resident.photo; 
    this.authService.postResident(this.resident).subscribe({
      next: (res) => {  
        if (photo ) {
          this.uploadImage(photo, res.idNumber)
        }
        this.alertService.openSuccess('Successfully Saved');
        setTimeout(() => {
          this.cancel();
        }, 2000);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  cancel() {
    this.resident = new Resident();
    this.authService.setLandOwnerData(this.resident, false);
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/resident' }
    });
  }

}


