// import { CommonModule } from '@angular/common';
// // import { ChangeDetectorRef, Component } from '@angular/core';
// import { ChangeDetectorRef, Component, DoCheck } from '@angular/core';
// import { FormsModule } from '@angular/forms';
// import { ActivatedRoute, Router } from '@angular/router';
// // import { catchError, concatMap, EMPTY, from } from 'rxjs';
// import { catchError, concatMap, EMPTY, from, of, Subject, debounceTime, switchMap } from 'rxjs';
// import { TownAddAccessRightsComponent } from 'src/app/_core/shared/components/town-add-access-rights/town-add-access-rights.component';
// import { TownLandOwnerComponent } from 'src/app/_core/shared/components/town-land-owner/town-land-owner.component';
// import { TownVehicleComponent } from 'src/app/_core/shared/components/town-vehicle/town-vehicle.component';
// import { MaterialModule } from 'src/app/_core/shared/material/material.module';
// import { AddonDataSource, Vehicle, AdditionalAccessRightsData, Guest } from 'src/app/models/common.model';
// import { AlertService } from 'src/app/services/alert.service';
// import { AuthService } from 'src/app/services/auth.service';
// import { ErrorHandlerService } from 'src/app/services/error-handler.service';
// import Swal from 'sweetalert2';
// @Component({
//   selector: 'app-guest',
//   imports: [CommonModule, MaterialModule, FormsModule,
//     TownLandOwnerComponent, TownVehicleComponent, TownAddAccessRightsComponent],
//   templateUrl: './guest.component.html',
//   styleUrl: './guest.component.scss'
// })


// // export class GuestComponent {
// export class GuestComponent implements DoCheck {
//   // guest
//   guest: Guest = new Guest();
//   isViewOrEdit: boolean = false;

//   // vehicle

//   vehicle = new Vehicle();
//   vehicleList: Vehicle[] = [];
//   dataSourceVehicle = new AddonDataSource(this.vehicleList);
//   // add access rights

//   addAccessRights = new AdditionalAccessRightsData();
//   dataToDisplayAAR: AdditionalAccessRightsData[] = [];
//   dataSourceAAR = new AddonDataSource(this.dataToDisplayAAR);

//     // photoPreview: string | ArrayBuffer | null = null;
//     photoPreview: string | ArrayBuffer | null = null;

//   // Reference lookup (tenant if living, else resident)
//   private lastKey = '';
//   private lookup$ = new Subject<void>();
//   referenceName = '';

//   constructor(private authService: AuthService,
//     private cd: ChangeDetectorRef,
//     private errorHandlerService: ErrorHandlerService,
//     private alertService: AlertService,
//     private router: Router,
//     // private activatedRoute: ActivatedRoute) {

//     private activatedRoute: ActivatedRoute) {
//     this.lookup$.pipe(
//       debounceTime(400),
//       switchMap(() => this.authService
//         .getResidentTenants(this.guest.building as any, this.guest.flatNumber as any)
//         .pipe(catchError(() => of(null))))
//     ).subscribe((res: any) => {
//       const tenants = res?.tenants || [];
//       const residents = res?.residents || [];
//       const selected = tenants.length > 0 ? tenants[0] : (residents.length > 0 ? residents[0] : null);
//       this.guest.rid = selected ? Number(selected.idNumber) : (null as any);
//       this.referenceName = selected
//         ? ([selected.firstName, selected.middleName, selected.lastName].filter(x => x).join(' ') || selected.shortName)
//         : '';
//     });
//   }
//   // guest
//   // ngOnInit() {
//   ngDoCheck() {
//     const n = this.guest?.nrd;
//     const b = this.guest?.building;
//     const f = this.guest?.flatNumber;
//     const key = `${n}|${b}|${f}`;
//     if (key === this.lastKey) return;
//     this.lastKey = key;
//     if (n && b && f) {
//       this.lookup$.next();
//     } else {
//       // this.guest.rid = null as any;
//       this.guest.rid = null as any;
//       this.referenceName = '';
//     }
//   }

//   ngOnInit() {
//      if (this.guest.idNumber && this.guest.idNumber !== '0') {
//       this.getImage(this.guest.idNumber)
//     }
//     this.activatedRoute.queryParams.subscribe(params => {
//       const id = params['id'];
//       if (id) {
//         this.isViewOrEdit = true;
//         this.getGuestById((Number)(id));

//       } else {
//         this.isViewOrEdit = false;
//       }
//     });
//   }
 
//     getImage(idNumber: string) {
//     this.authService.getImage(idNumber).subscribe({
//       next: (event: any) => {
//         if (event.base64) {
//           this.photoPreview = event.base64;
//         }
//       },
//       error: (err) => {
//         console.error('Upload failed:', err);
//       }
//     });
//   }

  
//   // Guest
//   getGuestById(id: number) {
//     this.authService.getGuestById(id).subscribe({
//       next: (res) => {
//         // this.guest = res.owners[0];
//         this.guest = res.owners[0];
//         // this.lastKey = `${this.guest.nrd}|${this.guest.building}|${this.guest.flatNumber}`;
//                 this.lastKey = `${this.guest.nrd}|${this.guest.building}|${this.guest.flatNumber}`;
//         this.referenceName = res.owners[0].referenceName || '';
//         this.vehicleList = res.vehicles;
//         this.dataToDisplayAAR = res.userAllAccess;
//       },
//       error: (err: any) => {
//         this.errorHandlerService.handleError(err);
//         this.cd.detectChanges();
//       }
//     });
//   }

//   updateGuest() {
//     if (this.guest.rid) {
//       this.guest.nrd = this.guest.nrd.toString();
//       this.guest.building = this.guest.building.toString();
//       this.guest.shortName = this.guest.firstName +  " " + this.guest.lastName ;
//       this.authService.updateGuest(this.guest).subscribe({
//       next: (res) => {
//         this.alertService.openSuccess('Successfully Saved');
//       },
//       error: (err: any) => {
//         this.errorHandlerService.handleError(err);
//         this.cd.detectChanges();
//       }
//       });
//     } else {
//       this.errorHandlerService.handleError({message: "Resident not found"});
//     }
    
//   }

//   // Additional Access Rights
//   updateAARTable(event) {
//     if (event.action === 'delete') {
//       this.deleteAccessRights(event.data);
//     } else if (event.action === 'update') {
//       this.postAccessRights(event.data);
//     } else if (event.action === 'add') {
//       this.postAccessRights(event.data);
//     }
//   }

//   updateAccessRights(accessRights: AdditionalAccessRightsData) {
//     accessRights.cardHolderID = this.guest.idNumber;
//     this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
//       next: (res) => {
//         this.alertService.openSuccess('Access rights updated successfully');
//         this.getGuestById(Number(this.guest.id));
//       },
//       error: (err: any) => {
//         this.errorHandlerService.handleError(err);
//         this.cd.detectChanges();
//       }
//     });
//   }

//   postAccessRights(accessRights: any) {
//       from(accessRights).pipe(
//         concatMap((accessRight: AdditionalAccessRightsData) =>
//           {
//             accessRight.cardHolderID = this.guest.idNumber
//             return this.authService.postLandOwnerAccessRights([accessRight]).pipe(
//               catchError((err) => {
//                 this.errorHandlerService.handleError(err);
//                 this.cd.detectChanges();
//                 return EMPTY; // Continue with the next accessRight even if an error occurs
//               })
//             )
//           }
//         )
//       ).subscribe({
//         next: (res) => {
//           this.alertService.openSuccess('Access right added successfully');
//           this.getGuestById(Number(this.guest.id));
//         },
//         error: (err) => {
//         }
//       });
//     }

//   deleteAccessRights(accessRights: AdditionalAccessRightsData) {
//       accessRights['logicalDeleted'] = '1';
//       this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
//         next: (res) => {
//           this.alertService.openSuccess('Access rights deleted successfully');
//           this.getGuestById(Number(this.guest.id));
//         },
//         error: (err: any) => {
//           console.log(err);
//           this.errorHandlerService.handleError(err);
//           this.cd.detectChanges();
//         }
//       });
//     }

//   // vehicle
//   updateVehicleTable(event) {
//     if (event.action === 'delete') {
//       this.deleteVehicle(event.data);
//     } else if (event.action === 'update') {
//       this.updateVehicle(event.data);
//     } else if (event.action === 'add') {
//       this.addVehicle(event.data);
//     }
//   }

//   addVehicle(vehicle: Vehicle) {
//       vehicle['tagUID'] = this.guest.idNumber;
//       this.authService.postLandOwnerVehicle(vehicle).subscribe({
//         next: (res) => {
//           this.alertService.openSuccess('Vehicle added successfully');
//           this.getGuestById(Number(this.guest.id));
//         },
//         error: (err: any) => {
//           this.errorHandlerService.handleError(err);
//           this.cd.detectChanges();
//         }
//       });
//     }
  
//     updateVehicle(vehicle: Vehicle) {
//       this.authService.updateLandOwnerVehicle(vehicle).subscribe({
//         next: (res) => {
//           this.alertService.openSuccess('Vehicle updated successfully');
//           this.getGuestById(Number(this.guest.id));
//         },
//         error: (err: any) => {
//           this.errorHandlerService.handleError(err);
//           this.cd.detectChanges();
//         }
//       });
//     }
  
//     // deleteVehicle(vehicle: Vehicle) {
//     //   vehicle['logicalDeleted'] = '1';
//     //   this.authService.updateLandOwnerVehicle(vehicle).subscribe({
//     //     next: (res) => {
//     //       this.alertService.openSuccess('Vehicle deleted successfully');
//     //       this.getGuestById(Number(this.guest.id));
//     //     },
//     //     error: (err: any) => {
//     //       this.errorHandlerService.handleError(err);
//     //       this.cd.detectChanges();
//     //     }
//     //   });
//     // }

//     deleteVehicle(vehicle: Vehicle) {
//   // Check if already deleted - offer to restore
//   if (vehicle.logical_Delete === 1) {
//     Swal.fire({
//       title: 'Already Deleted!',
//       text: `Vehicle ${vehicle.regNo} is already deleted. Do you want to restore it?`,
//       icon: 'info',
//       showCancelButton: true,
//       confirmButtonColor: '#28a745',
//       cancelButtonColor: '#6c757d',
//       confirmButtonText: 'Yes, restore it!',
//       cancelButtonText: 'Cancel'
//     }).then((result) => {
//       if (result.isConfirmed) {
//         // Restore vehicle by setting logical_Delete = 0
//         vehicle.logical_Delete = 0;
//         this.authService.updateLandOwnerVehicle(vehicle).subscribe({
//           next: (res) => {
//             console.log("Vehicle restored successfully", res);
//             this.alertService.openSuccess('Vehicle restored successfully');
//             this.getGuestById(Number(this.guest.id));
//           },
//           error: (err: any) => {
//             console.log(err);
//             this.errorHandlerService.handleError(err);
//             this.cd.detectChanges();
//           }
//         });
//       }
//     });
//     return; // Stop deletion process
//   }

//   // Normal deletion process
//   Swal.fire({
//     title: 'Are you sure?',
//     text: `Do you want to delete vehicle ${vehicle.regNo}?`,
//     icon: 'warning',
//     showCancelButton: true,
//     confirmButtonColor: '#d33',
//     cancelButtonColor: '#3085d6',
//     confirmButtonText: 'Yes, delete it!',
//     cancelButtonText: 'Cancel'
//   }).then((result) => {
//     if (result.isConfirmed) {
//       // Mark vehicle as logically deleted
//       vehicle.logical_Delete = 1;
//       this.authService.updateLandOwnerVehicle(vehicle).subscribe({
//         next: (res) => {
//           console.log("Vehicle deleted successfully", res);
//           this.alertService.openSuccess('Vehicle deleted successfully');
//           this.getGuestById(Number(this.guest.id));
//         },
//         error: (err: any) => {
//           console.log(err);
//           this.errorHandlerService.handleError(err);
//           this.cd.detectChanges();
//         }
//       });
//     }
//   });
// }

  
//   // Save Form
//   saveGuest() {
//     if (this.guest.rid) {
//       this.guest.nrd = this.guest.nrd.toString();
//       this.guest.building = this.guest.building.toString();
//       this.guest.shortName = this.guest.firstName +  " " + this.guest.lastName ;
//        let photo = this.guest.photo; 
//     delete this.guest.photo;
//       this.authService.postGuest(this.guest).subscribe({
//         next: (res) => {
//            this.alertService.openSuccess(res.idNumber);
//         //  this.alertService.openSuccess('Successfully Saved');
//          if (photo ) {
//            this.uploadImage(photo, res.idNumber)
//         }
//           this.alertService.openSuccess('Successfully Saved');
//           setTimeout(() => {
//             this.cancel();
//           }, 2000);
//         },
//         error: (err: any) => {
//           console.log(err);
//           this.errorHandlerService.handleError(err);
//           this.cd.detectChanges();
//         }
//       });
//     } else {
//       this.errorHandlerService.handleError({message: "Resident not found"});
//     }
//   }

//    uploadImage(selectedFile, idnumber) {
//     this.authService.uploadImage(selectedFile, idnumber);
//   }

//   cancel() {
//     this.guest = new Guest();
//     this.authService.setLandOwnerData(this.guest, false);
//     this.router.navigate(['/search'], {
//       queryParams: { returnPath: '/guest' }
//     });
//   }

// }



import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, DoCheck } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, EMPTY, from, of, Subject, debounceTime, switchMap, map } from 'rxjs';
import { TownAddAccessRightsComponent } from 'src/app/_core/shared/components/town-add-access-rights/town-add-access-rights.component';
import { TownLandOwnerComponent } from 'src/app/_core/shared/components/town-land-owner/town-land-owner.component';
import { TownVehicleComponent } from 'src/app/_core/shared/components/town-vehicle/town-vehicle.component';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AddonDataSource, Vehicle, AdditionalAccessRightsData, Guest } from 'src/app/models/common.model';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-guest',
  imports: [CommonModule, MaterialModule, FormsModule,
    TownLandOwnerComponent, TownVehicleComponent, TownAddAccessRightsComponent],
  templateUrl: './guest.component.html',
  styleUrl: './guest.component.scss'
})
export class GuestComponent implements DoCheck {

  // guest
  guest: Guest = new Guest();
  isViewOrEdit: boolean = false;

  // vehicle
  vehicle = new Vehicle();
  vehicleList: Vehicle[] = [];
  dataSourceVehicle = new AddonDataSource(this.vehicleList);

  // add access rights
  addAccessRights = new AdditionalAccessRightsData();
  dataToDisplayAAR: AdditionalAccessRightsData[] = [];
  dataSourceAAR = new AddonDataSource(this.dataToDisplayAAR);

  photoPreview: string | ArrayBuffer | null = null;

  // ---------------------------------------------------------------
  // Reference (current tenant of the flat, else the resident)
  //  - referenceRid  : IDNumber that is saved into GuestMaster.RID
  //  - referenceName : name shown in the "Load Reference" box
  // referenceRid is kept here (not only in guest.rid) so nothing else
  // on the page can wipe it before Save / Update.
  // ---------------------------------------------------------------
  referenceName = '';
  private referenceRid: number | null = null;
  private lastKey = '';
  private searchSeq = 0;
  private lookup$ = new Subject<void>();

  constructor(private authService: AuthService,
    private cd: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {

    this.lookup$.pipe(
      debounceTime(400),
      switchMap(() => {
        const seq = this.searchSeq;
        const nrd = this.guest?.nrd;
        const building = this.guest?.building;
        const flat = this.flatText();

        // never search with an empty field (an empty flat returns the whole building)
        if (!nrd || !building || !flat) {
          return of({ seq, res: null });
        }
        return this.authService
          .getResidentTenants(building as any, flat as any)
          .pipe(
            map(res => ({ seq, res })),
            catchError(() => of({ seq, res: null }))
          );
      })
    ).subscribe(({ seq, res }: any) => {
      // ignore an old response if NRD / Building / Flat changed meanwhile
      if (seq !== this.searchSeq) return;

      const tenants = res?.tenants || [];
      const residents = res?.residents || [];
      const selected = tenants.length > 0 ? tenants[0] : (residents.length > 0 ? residents[0] : null);

      this.referenceRid = selected ? Number(selected.idNumber) : null;
      this.guest.rid = this.referenceRid as any;
      this.referenceName = selected
        ? ([selected.firstName, selected.middleName, selected.lastName].filter(x => x).join(' ') || selected.shortName)
        : '';
    });
  }

  private flatText(): string {
    return String(this.guest?.flatNumber ?? '').trim();
  }

  private currentKey(): string {
    return `${this.guest?.nrd}|${this.guest?.building}|${this.flatText()}`;
  }

  private clearReference() {
    this.referenceRid = null;
    this.referenceName = '';
    if (this.guest) {
      this.guest.rid = null as any;
    }
  }

  // runs whenever NRD / Building / Flat No changes (typed, erased or selected)
  ngDoCheck() {
    const key = this.currentKey();
    if (key === this.lastKey) return;
    this.lastKey = key;
    this.searchSeq++;   // makes every older lookup response stale

    if (this.guest?.nrd && this.guest?.building && this.flatText()) {
      this.lookup$.next();
    } else {
      this.clearReference();   // any field empty -> reference is cleared immediately
    }
  }

  // guest
  ngOnInit() {
    if (this.guest.idNumber && this.guest.idNumber !== '0') {
      this.getImage(this.guest.idNumber)
    }
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isViewOrEdit = true;
        this.getGuestById((Number)(id));
      } else {
        this.isViewOrEdit = false;
      }
    });
  }

  getImage(idNumber: string) {
    this.authService.getImage(idNumber).subscribe({
      next: (event: any) => {
        if (event.base64) {
          this.photoPreview = event.base64;
        }
      },
      error: (err) => {
        console.error('Upload failed:', err);
      }
    });
  }

  // Guest
  getGuestById(id: number) {
    this.authService.getGuestById(id).subscribe({
      next: (res) => {
        this.guest = res.owners[0];

        // loading a saved guest must not start a new lookup
        this.lastKey = this.currentKey();
        this.searchSeq++;

        // keep the saved RID and its name exactly as stored on the server
        this.referenceRid = res.owners[0].rid ? Number(res.owners[0].rid) : null;
        this.referenceName = res.owners[0].referenceName || '';

        this.vehicleList = res.vehicles;
        this.dataToDisplayAAR = res.userAllAccess;
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  updateGuest() {
    // always send the reference RID kept by this page
    this.guest.rid = this.referenceRid as any;

    if (this.guest.rid) {
      this.guest.nrd = this.guest.nrd.toString();
      this.guest.building = this.guest.building.toString();
      this.guest.shortName = this.guest.firstName + " " + this.guest.lastName;
      this.authService.updateGuest(this.guest).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Successfully Saved');
        },
        error: (err: any) => {
          this.errorHandlerService.handleError(err);
          this.cd.detectChanges();
        }
      });
    } else {
      this.errorHandlerService.handleError({ message: "Resident not found" });
    }
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
    accessRights.cardHolderID = this.guest.idNumber;
    this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access rights updated successfully');
        this.getGuestById(Number(this.guest.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  postAccessRights(accessRights: any) {
    from(accessRights).pipe(
      concatMap((accessRight: AdditionalAccessRightsData) => {
        accessRight.cardHolderID = this.guest.idNumber
        return this.authService.postLandOwnerAccessRights([accessRight]).pipe(
          catchError((err) => {
            this.errorHandlerService.handleError(err);
            this.cd.detectChanges();
            return EMPTY; // Continue with the next accessRight even if an error occurs
          })
        )
      })
    ).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access right added successfully');
        this.getGuestById(Number(this.guest.id));
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
        this.getGuestById(Number(this.guest.id));
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
    vehicle['tagUID'] = this.guest.idNumber;
    this.authService.postLandOwnerVehicle(vehicle).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Vehicle added successfully');
        this.getGuestById(Number(this.guest.id));
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
        this.getGuestById(Number(this.guest.id));
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

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
              this.getGuestById(Number(this.guest.id));
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
            this.getGuestById(Number(this.guest.id));
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

  // Save Form
  saveGuest() {
    // always send the reference RID kept by this page
    this.guest.rid = this.referenceRid as any;

    if (this.guest.rid) {
      this.guest.nrd = this.guest.nrd.toString();
      this.guest.building = this.guest.building.toString();
      this.guest.shortName = this.guest.firstName + " " + this.guest.lastName;
      let photo = this.guest.photo;
      delete this.guest.photo;
      this.authService.postGuest(this.guest).subscribe({
        next: (res) => {
          this.alertService.openSuccess(res.idNumber);
          if (photo) {
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
    } else {
      this.errorHandlerService.handleError({ message: "Resident not found" });
    }
  }

  uploadImage(selectedFile, idnumber) {
    this.authService.uploadImage(selectedFile, idnumber);
  }

  cancel() {
    this.guest = new Guest();
    this.clearReference();
    this.authService.setLandOwnerData(this.guest, false);
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/guest' }
    });
  }

}

