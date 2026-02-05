import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, EMPTY, from } from 'rxjs';
import { TownAddAccessRightsComponent } from 'src/app/_core/shared/components/town-add-access-rights/town-add-access-rights.component';
import { TownAddOnCardComponent } from 'src/app/_core/shared/components/town-add-on-card/town-add-on-card.component';
import { TownLandOwnerComponent } from 'src/app/_core/shared/components/town-land-owner/town-land-owner.component';
import { TownVehicleComponent } from 'src/app/_core/shared/components/town-vehicle/town-vehicle.component';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AddonCard, AddonDataSource, Vehicle, AdditionalAccessRightsData, Tenant } from 'src/app/models/common.model';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-tenant',
  imports: [CommonModule, MaterialModule, FormsModule,
    TownLandOwnerComponent, TownAddOnCardComponent,
    TownVehicleComponent, TownAddAccessRightsComponent],
  templateUrl: './tenant.component.html',
  styleUrl: './tenant.component.scss'
})
export class TenantComponent {

  // tenant
  tenant: Tenant = new Tenant();
  isViewOrEdit: boolean = false;

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
  tenantType: number;

  constructor(private authService: AuthService,
    private cd: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  private sortService: TableSortService
  ) {
  }
  // tenant
  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        // this.resident = data;
        this.isViewOrEdit = true;
        this.getTenantById((Number)(id));

      } else {
        this.isViewOrEdit = false;
      }
    });
  }

  setTenantType(type: number) {
    this.tenantType = type;
  }

  // Tenant
  getTenantById(id: number) {
    this.authService.getTenantById(id).subscribe({
      next: (res) => {
        this.tenant = res.owners[0];
        this.tenantType = this.tenant.tenentType
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

  updateTenant() {
    this.tenant.shortName = this.tenant.firstName + " " + this.tenant.lastName;
    this.tenant.tenentType = Number(this.tenant.tenentType);
    this.authService.updateTenant(this.tenant).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Saved');
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
    this.addonCardList.forEach((element) => {
      element.pid = Number(this.tenant.id);
      element.mobileNo = element.mobileNo.toString();
    });
  }

  setRequiredFields(addonCard) {
    addonCard.pid = Number(this.tenant.id);
    addonCard.mobileNo = addonCard.mobileNo.toString();
    addonCard.logicalDeleted = 0;
    addonCard.building = this.tenant.building;
    addonCard.nrd = this.tenant.nrd;
  }

  // Add on card

  addAddOnTable(addonCard: any) {
    // this.dataToDisplay = event;
    this.setRequiredFields(addonCard)
     let photo = this.addonCard.photo; 
     delete this.addonCard.photo;
    this.authService.postTenentAddonCard(addonCard).subscribe({
      next: (res) => {
        if (photo ) {
             this.authService.uploadImage(photo, res.idnumber)
         }
        this.alertService.openSuccess('Successfully Saved');
        this.getTenantById(Number(this.tenant.id));
      },
      error: (err: any) => {
        // console.log(err);
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

  updateAccessRights(accessRights: AdditionalAccessRightsData) {
    accessRights.cardHolderID = this.tenant.idNumber;
    this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access rights updated successfully');
        this.getTenantById(Number(this.tenant.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  postAccessRights(accessRights: any) {
      from(accessRights).pipe(
        concatMap((accessRight: AdditionalAccessRightsData) =>
          {
            accessRight.cardHolderID = this.tenant.idNumber
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
          this.getTenantById(Number(this.tenant.id));
        },
        error: (err) => {
        }
      });
    }

  deleteAccessRights(accessRights: AdditionalAccessRightsData) {
      accessRights['logicalDeleted'] = '1';
      this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Access rights deleted successfully');
          this.getTenantById(Number(this.tenant.id));
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
      vehicle['tagUID'] = this.tenant.idNumber;
      this.authService.postLandOwnerVehicle(vehicle).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Vehicle added successfully');
          this.getTenantById(Number(this.tenant.id));
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
          this.getTenantById(Number(this.tenant.id));
        },
        error: (err: any) => {
          this.errorHandlerService.handleError(err);
          this.cd.detectChanges();
        }
      });
    }
  
    // deleteVehicle(vehicle: Vehicle) {
    //   vehicle['logicalDeleted'] = '1';
    //   this.authService.updateLandOwnerVehicle(vehicle).subscribe({
    //     next: (res) => {
    //       this.alertService.openSuccess('Vehicle deleted successfully');
    //       this.getTenantById(Number(this.tenant.id));
    //     },
    //     error: (err: any) => {
    //       this.errorHandlerService.handleError(err);
    //       this.cd.detectChanges();
    //     }
    //   });
    // }
deleteVehicle(vehicle: Vehicle) {
  // Check if already deleted - offer to restore
  if (vehicle.logical_Delete === 1) {
    Swal.fire({
      title: 'Already Deleted!',
      text: `Vehicle ${vehicle.regNo} is already deleted. Do you want to restore it?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, restore it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Restore vehicle by setting logical_Delete = 0
        vehicle.logical_Delete = 0;
        this.authService.updateLandOwnerVehicle(vehicle).subscribe({
          next: (res) => {
            console.log("Vehicle restored successfully", res);
            this.alertService.openSuccess('Vehicle restored successfully');
            this.getTenantById(Number(this.tenant.id));
          },
          error: (err: any) => {
            console.log(err);
            this.errorHandlerService.handleError(err);
            this.cd.detectChanges();
          }
        });
      }
    });
    return; // Stop deletion process
  }

  // Normal deletion process
  Swal.fire({
    title: 'Are you sure?',
    text: `Do you want to delete vehicle ${vehicle.regNo}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Yes, delete it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      // Mark vehicle as logically deleted
      vehicle.logical_Delete = 1;
      this.authService.updateLandOwnerVehicle(vehicle).subscribe({
        next: (res) => {
          console.log("Vehicle deleted successfully", res);
          this.alertService.openSuccess('Vehicle deleted successfully');
          this.getTenantById(Number(this.tenant.id));
        },
        error: (err: any) => {
          console.log(err);
          this.errorHandlerService.handleError(err);
          this.cd.detectChanges();
        }
      });
    }
  });
}


  updateAddOnTable(addonCard: any) {
    // this.dataToDisplay = event; 
    this.setRequiredFields(addonCard)
    this.authService.updateTenentAddonCard(addonCard).subscribe({
      next: (res) => {
        console.log("post landowner", res)
        this.alertService.openSuccess('Successfully Updated');
        this.getTenantById(Number(this.tenant.id));
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  deleteAddOnTable(addonCard: any) {
    addonCard.mobileNo = addonCard.mobileNo.toString();
    addonCard['logicalDeleted'] = '1';
    this.authService.updateTenentAddonCard(addonCard).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Deleted');
        this.getTenantById(Number(this.tenant.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }
  
  // Save Form

  saveTenant() {
    this.tenant.shortName = this.tenant.firstName + " " + this.tenant.lastName;
    this.tenant.tenentType = Number(this.tenant.tenentType); 

     let photo = this.tenant.photo; 
     delete this.tenant.photo;

    this.authService.postTenant(this.tenant).subscribe({
      next: (res) => {
        if (photo ) {
             this.authService.uploadImage(photo, res.idNumber)
         }
        console.log("post tenant", res)
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
    console.log(this.dataToDisplayAAR);
  }


  cancel() {
    this.tenant = new Tenant();
    this.authService.setLandOwnerData(this.tenant, false);
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/tenant' }
    });
  }

}

