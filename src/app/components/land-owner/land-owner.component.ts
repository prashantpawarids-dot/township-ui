
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { TownLandOwnerComponent } from 'src/app/_core/shared/components/town-land-owner/town-land-owner.component';
import { TownAddOnCardComponent } from 'src/app/_core/shared/components/town-add-on-card/town-add-on-card.component';
import { TownVehicleComponent } from 'src/app/_core/shared/components/town-vehicle/town-vehicle.component';
import { TownAddAccessRightsComponent } from 'src/app/_core/shared/components/town-add-access-rights/town-add-access-rights.component';
import { LandOwner, AddonCard, AddonDataSource, Vehicle, AdditionalAccessRightsData } from 'src/app/models/common.model';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, EMPTY, from } from 'rxjs';
import { DateAdapter } from '@angular/material/core';

@Component({
  selector: 'app-land-owner',
  imports: [CommonModule, MaterialModule, FormsModule,
    TownLandOwnerComponent, TownAddOnCardComponent,
    TownVehicleComponent, TownAddAccessRightsComponent],
  templateUrl: './land-owner.component.html',
  styleUrl: './land-owner.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class LandOwnerComponent implements OnInit, OnDestroy {
  // land owner
  landowner: LandOwner = new LandOwner();
  isViewOrEdit: boolean = false;
   viewMode: boolean = false;
  private activatedRoute = inject(ActivatedRoute);

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        // this.landowner = data;
        const view = params['view'];
        if (view == 'true') {
          this.viewMode = true;
        }
        this.isViewOrEdit = true;
        this.getLandownerById((Number)(id));

      } else {
        this.isViewOrEdit = false;
      }
    });

  }
  // add on card

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
    private router: Router) {
  }
  // landowner

  getLandownerById(id: number) {
    this.authService.getLandOwnerById(id).subscribe({
      next: (res) => {
        this.landowner = res.owners[0];
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

  // Add on card

  addAddOnTable(addonCard: any) {
    // this.dataToDisplay = event;
    addonCard.pid = Number(this.landowner.id);
    addonCard.mobileNo = addonCard.mobileNo.toString();
     let photo = this.addonCard.photo ; 
    //  delete this.addonCard.photo;
    //  this.uploadImage(photo, addonCard.idNumber)
    this.authService.postLandOwnerAddonCard(addonCard).subscribe({
      next: (res) => {
         if (photo ) {
             this.authService.uploadImage(photo, res.idnumber)
         }
        this.alertService.openSuccess('Successfully Saved');
        this.getLandownerById(Number(this.landowner.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  deleteAddOnTable(addonCard: any) {
    // this.dataToDisplay = event; 
    addonCard.mobileNo = addonCard.mobileNo.toString();
    addonCard['logicalDeleted'] = '1';
    this.authService.updateLandOwnerAddonCard(addonCard).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Deleted');
        this.getLandownerById(Number(this.landowner.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }
  updateAddOnTable(addonCard: any) {
    // this.dataToDisplay = event; 
    addonCard.mobileNo = addonCard.mobileNo.toString();
    this.authService.updateLandOwnerAddonCard(addonCard).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Updated');
        this.getLandownerById(Number(this.landowner.id));
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
    vehicle['tagUID'] = this.landowner.idNumber;
    this.authService.postLandOwnerVehicle(vehicle).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Vehicle added successfully');
        this.getLandownerById(Number(this.landowner.id));
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
        this.getLandownerById(Number(this.landowner.id));
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
        this.getLandownerById(Number(this.landowner.id));
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
          accessRight.cardHolderID = this.landowner.idNumber
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
        this.getLandownerById(Number(this.landowner.id));
      },
      error: (err) => {
      }
    });
  }

  updateAccessRights(accessRights: AdditionalAccessRightsData) {
    accessRights[0].cardHolderID = this.landowner.idNumber;
    this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access rights updated successfully');
        this.getLandownerById(Number(this.landowner.id));
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
        this.getLandownerById(Number(this.landowner.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }
  // Save Form

  saveLandOwner() {
    this.landowner.shortName = this.landowner.firstName + " " + this.landowner.lastName;

// this.landowner.cardIssueDate="2025-08-02T00:00:00";
// this.landowner.cardPrintingDate="2025-08-02T00:00:00";
// this.landowner.landOwnerIssueDate="2025-08-02T00:00:00"; 
    let photo = this.landowner.photo; 
    delete this.landowner.photo;
    this.authService.postLandOwner(this.landowner).subscribe({
      next: (res) => {
        console.log(res)
        console.log(res.idNumber);
        
        this.alertService.openSuccess(res.idNumber);
        //  this.alertService.openSuccess('Successfully Saved');
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

  uploadImage(selectedFile, idnumber) {
    this.authService.uploadImage(selectedFile, idnumber);
  }

  updateLandOwner() {
    this.landowner.shortName = this.landowner.firstName + " " + this.landowner.lastName
    this.authService.updateLandOwner(this.landowner).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Saved');
        
         if (this.landowner.photo!=null ) {
          this.uploadImage(this.landowner.photo, this.landowner.idNumber)
        }
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
    this.addonCardList.forEach((element) => {
      element.pid = Number(this.landowner.id);
      element.mobileNo = element.mobileNo.toString();
    });
  }

  cancel() {
    this.landowner = new LandOwner();
    this.authService.setLandOwnerData(this.landowner, false);
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/land-owner' }
    });
  }

  ngOnDestroy(): void {
    this.landowner = new LandOwner();
    this.authService.setLandOwnerData(this.landowner, false);
  }
}

