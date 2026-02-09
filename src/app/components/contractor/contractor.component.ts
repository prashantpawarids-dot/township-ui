import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, EMPTY, from } from 'rxjs';
import { TownLandOwnerComponent } from 'src/app/_core/shared/components/town-land-owner/town-land-owner.component';
import { TownAddAccessRightsComponent } from 'src/app/_core/shared/components/town-add-access-rights/town-add-access-rights.component';
import { TownVehicleComponent } from 'src/app/_core/shared/components/town-vehicle/town-vehicle.component';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AddonDataSource, Vehicle, AdditionalAccessRightsData, LandOwner, AddonCard,Contractors  } from 'src/app/models/common.model';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { TownAddOnCardComponent } from 'src/app/_core/shared/components/town-add-on-card/town-add-on-card.component';
import Swal from 'sweetalert2';
@Component({
  // AuthorityLevel
  selector: 'app-contractor',
  imports: [CommonModule, MaterialModule, FormsModule,
    TownLandOwnerComponent, TownVehicleComponent, TownAddAccessRightsComponent,
  TownAddOnCardComponent],
  templateUrl: './contractor.component.html',
  styleUrl: './contractor.component.scss'
})
export class ContractorComponent implements OnInit, OnDestroy  {

  constructor(private authService: AuthService,
    private cd: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }
  // contractor
  contractor: Contractors = new Contractors();
  
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
  isViewOrEdit: boolean = false;
  contractorOptions = [];
  
   projectOptions: any[] = [];
  

    getProject() {
    this.authService.getProject().subscribe(res => {
      this.projectOptions = res;
    });
    
  }
    displayProjectName = (projectName: string): string => {
    const match = this.projectOptions?.find(opt => opt.id == projectName)
    return match && match.projectName ? match.projectName : '';
  }

  

 

  ngOnInit() {
    this.getContractorType();
    this.getProject();
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isViewOrEdit = true;
        this.getContractorById((Number)(id));

      } else {
        this.isViewOrEdit = false;
      }
    });
  }

  // getContractorType() {
  //   this.authService.getContractorType().subscribe({
  //     next: (res) => {
  //       this.contractorOptions = res;
  //     },
  //     error: (err: any) => {
  //       this.errorHandlerService.handleError(err);
  //       this.cd.detectChanges();
  //     }
  //   });
  // }

  getContractorType() {
  this.authService.getContractorType().subscribe({
    next: (res: any[]) => {
      // Filter out items where isactive is false
      this.contractorOptions = res.filter(item => item.isactive !== false);
    },
    error: (err: any) => {
      this.errorHandlerService.handleError(err);
      this.cd.detectChanges();
    }
  });
}

  // contractor
  getContractorById(id: number) {
    this.authService.getContractorById(id).subscribe({
      next: (res) => {
        this.contractor = res.owners[0];
        
        this.addonCardList = res.dependentOwners;
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

  // Add on card

  addAddOnTable(addonCard: any) {
    // this.dataToDisplay = event;
    addonCard.pid = Number(this.contractor.id);
    addonCard.mobileNo = addonCard.mobileNo.toString();
     let photo = this.contractor.photo; 
     delete this.contractor.photo;
    this.authService.postContractorAddonCard(addonCard).subscribe({
      next: (res) => {
         if (photo ) {
             this.authService.uploadImage(photo, res.idnumber)
             this.alertService.openSuccess('Successfully Saved');
             this.getContractorById(Number(this.contractor.id));
         }
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
    this.authService.updateContractorAddonCard(addonCard).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Deleted');
        this.getContractorById(Number(this.contractor.id));
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
    this.authService.updateContractorAddonCard(addonCard).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Updated');
        this.getContractorById(Number(this.contractor.id));
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
    vehicle['tagUID'] = this.contractor.idNumber;
    this.authService.postLandOwnerVehicle(vehicle).subscribe({
      next: (res) => {
        console.log("Vehicle added successfully", res);
        this.alertService.openSuccess('Vehicle added successfully');
        this.getContractorById(Number(this.contractor.id));
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
        this.getContractorById(Number(this.contractor.id));
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  // deleteVehicle(vehicle: Vehicle) {
  //   vehicle['logicalDeleted'] = '1';
  //   this.authService.updateLandOwnerVehicle(vehicle).subscribe({
  //     next: (res) => {
  //       console.log("Vehicle deleted successfully", res);
  //       this.alertService.openSuccess('Vehicle deleted successfully');
  //       this.getContractorById(Number(this.contractor.id));
  //     },
  //     error: (err: any) => {
  //       console.log(err);
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
            this.getContractorById(Number(this.contractor.id));
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
      this.authService.deleteVehicle(vehicle.id).subscribe({
        next: (res) => {
          console.log("Vehicle deleted successfully", res);
          this.alertService.openSuccess('Vehicle deleted successfully');
          // Remove from local array immediately
          this.vehicleList = this.vehicleList.filter(v => v.id !== vehicle.id);
          this.dataSourceVehicle.setData(this.vehicleList);
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
          accessRight.cardHolderID = this.contractor.idNumber
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
        this.getContractorById(Number(this.contractor.id));
      },
      error: (err) => {
      }
    });
  }

  updateAccessRights(accessRights: AdditionalAccessRightsData) {
    accessRights.cardHolderID = this.contractor.idNumber;
    this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access rights updated successfully');
        this.getContractorById(Number(this.contractor.id));
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
        this.getContractorById(Number(this.contractor.id));
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }
  // Save Form

  saveContractor() {
    this.contractor.id = this.contractor.id == undefined ? "0" : this.contractor.id
    this.contractor.mobileNo = this.contractor.mobileNo.toString(); 
      
     let photo = this.contractor.photo; 
    delete this.contractor.photo;
    this.authService.postContractor(this.contractor).subscribe({
      next: (res) => {
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
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }
 uploadImage(selectedFile, idnumber) {
    this.authService.uploadImage(selectedFile, idnumber);
  }

  updateContractor() {
    this.contractor.mobileNo = this.contractor.mobileNo.toString();
    this.authService.updateContractor(this.contractor).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Successfully Updated');
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  cancel() {
    this.contractor = new Contractors();
    this.authService.setLandOwnerData(this.contractor, false);
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/contractor' }
    });
  }

  ngOnDestroy(): void {
    this.contractor = new  Contractors();
    this.authService.setLandOwnerData(this.contractor, false);
  }
}
