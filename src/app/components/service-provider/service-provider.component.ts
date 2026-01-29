import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, EMPTY, from, map, Observable, startWith } from 'rxjs';
import { TownAddAccessRightsComponent } from 'src/app/_core/shared/components/town-add-access-rights/town-add-access-rights.component';
import { TownVehicleComponent } from 'src/app/_core/shared/components/town-vehicle/town-vehicle.component';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AddonDataSource, Vehicle, AdditionalAccessRightsData, ServiceProvider } from 'src/app/models/common.model';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { ElementRef, ViewChild } from '@angular/core'
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';


@Component({
  selector: 'app-service-provider',
  imports: [CommonModule, MaterialModule, FormsModule,
    TownVehicleComponent, TownAddAccessRightsComponent, ReactiveFormsModule],
  templateUrl: './service-provider.component.html',
  styleUrl: './service-provider.component.scss'
})
export class ServiceProviderComponent implements OnInit, OnDestroy {

  // serviceForm: FormGroup;

  parentID: string = '';


  constructor(private authService: AuthService,
    private cd: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
    this.reference1 = new FormControl();
    this.filteredResidents = this.reference1.valueChanges
      .pipe(
        startWith(''),
        map(reference => reference ? this.filterReference(reference) : this.residents.slice())
      );
  }

  @ViewChild('addonphoto')
  addonphoto: ElementRef;
  @ViewChild('reference1Input') inputField: ElementRef;
  @Output() addonEventUpdate = new EventEmitter<any>();
  @Output() addonEventDelete = new EventEmitter<any>();

  // serviceProvider
  serviceProvider: ServiceProvider = new ServiceProvider();
  // add on card
  // vehicle
  vehicle = new Vehicle();
  vehicleList: Vehicle[] = [];
  dataSourceReference: any = [];
  dataSourceVehicle = new AddonDataSource(this.vehicleList);
  displayedColumnsReference: any[] = ['srno', 'ownerName', 'neighbourhood', 'building', 'flatNumber', 'actions'];
  // add access rights
  addAccessRights = new AdditionalAccessRightsData();
  dataToDisplayAAR: AdditionalAccessRightsData[] = [];
  dataSourceAAR = new AddonDataSource(this.dataToDisplayAAR);
  neighbourhoodOptions: any[] = [];
  serviceTypeOptions: any[] = [];
  buildingOptions: any[] = [];
  isViewOrEdit: boolean = false;
  reference1: FormControl;
  residents: any[] = [];
  tenants: any[] = [];
  filteredResidents: Observable<any[]>
  isUpdate: boolean = false;


  referenceOwner: any = {
    id: 0,
    sProviderID: "",
    // hid: "",
    // ownerDetails: "",
    // isActive: true,
    neighbourhood: "",
    building: "",
    flatNumber: "",
    residentReferenceName: "",
    // ownerName: ""
  };

  searchResident1: any = {
    nrd: "",
    building: "",
    flatNumber: ""
  }
checkLength(value: string, fieldName: string) {
  if (value.length > 20) {
    alert(`${fieldName} cannot exceed 20 characters`);
    this.serviceProvider[fieldName.replace(' ', '').toLowerCase()] =
      value.substring(0, 20);
  }
}

  onClickAddon() {
    if (this.addonphoto)
      this.addonphoto.nativeElement.click()
  }

  // /Aakash Logic
  //  photo: string | null = null; // API image filename or URL

  photoPreview: string | ArrayBuffer | null = null;
  disableFields = false;
  selectedFile: File | null = null;
  @ViewChild('fileUpload') fileUpload: ElementRef;

  onClick(event: Event) {
    if (this.fileUpload) {
      this.fileUpload.nativeElement.click();
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.uploadFile()
    }
  }

  uploadFile() {
    if (!this.selectedFile) return;
    this.showImageOnScreen()
    if (!Number(this.serviceProvider.idNumber)) {
      this.serviceProvider.photo = this.selectedFile;
      return;
    }
    //this.authService.uploadImage(this.selectedFile, this.serviceProvider.idNumber);
  }
  ngOnChanges(): void {

    if (this.serviceProvider.idNumber && this.serviceProvider.idNumber !== '0') {
      this.getImage(this.serviceProvider.idNumber)
    }
  }

  showImageOnScreen() {
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result;
    };
    reader.readAsDataURL(this.selectedFile);
  }

  //  ngOnChanges(): void {    
  //     if (this.serviceProvider.idNumber && this.serviceProvider.idNumber !== '0') {
  //       this.getImage(this.serviceProvider.idNumber)
  //     }
  //   }

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

  filterReference(name: string) {
    return this.residents.filter(reference =>
      reference.firstName.toLowerCase().indexOf(name.toLowerCase()) === 0 || reference.idNumber.indexOf(name) === 0);
  }

  ngOnInit() {
    this.getServiceType()
    // this.showImageOnScreen()
    this.serviceProvider.id = 0;
    this.serviceProvider.isActive = 1;
    this.serviceProvider.isDeleted = 0;
    this.serviceProvider.createdby = 0;
    this.serviceProvider.updatedby = 0;
    this.serviceProvider.updatedon = new Date().toISOString();
    this.serviceProvider.createdon = new Date().toISOString();
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isViewOrEdit = true;
        this.getServiceProviderById((Number)(id));
        this.getBuildings();
        this.getNeighbourhood();
        this.getResident();
        if (this.serviceProvider.idNumber && this.serviceProvider.idNumber !== '0') {
          this.getImage(this.serviceProvider.idNumber);
        }
      } else {
        this.isViewOrEdit = false;
      }
    });

  }

  getAllServiceProviderOwners(id: string) {
    this.authService.getAllServiceProviderOwners(id).subscribe(res => {
      this.dataSourceReference = [...res];
    })
  }

  getResident() {
    //this.authService.getResident().subscribe(res => {
    this.authService.getResident().subscribe(res => {
      this.residents = [...res];
    })
  }

 filterResident() {
  if (this.referenceOwner.neighbourhood && this.referenceOwner.building && this.referenceOwner.flatNumber) {
    this.authService.getResidentTenants(this.referenceOwner.building, this.referenceOwner.flatNumber)
      .subscribe((res: any) => {
        this.residents = res.residents || [];
        this.tenants = res.tenants || [];

        // setTimeout(() => {
          const selected = this.tenants.length > 0 ? this.tenants[0] : (this.residents.length > 0 ? this.residents[0] : null);
          if (selected) {
            const fullName = [selected.firstName, selected.middleName, selected.lastName].join(" ").trim();
            this.reference1.patchValue(selected.mobileNo + " - " + selected.shortName);
console.log(selected);

            this.referenceOwner.hid = selected.idNumber;
            this.referenceOwner.residentReferenceName = fullName|| selected.shortName;
            // this.referenceOwner.ownerDetails = `${selected.idNumber} - ${fullName}, ${selected.nrdName} ${selected.buildingName}-${selected.flatNumber}`;
            this.referenceOwner.building = selected.building.toString();
            this.referenceOwner.neighbourhood = selected.nrd.toString();
            this.referenceOwner.flatNumber = selected.flatNumber.toString();
          } else {
            // this.reference1.reset();
            // this.referenceOwner = {};
            // alert("No data available for the selected flat.");
          }
        // }, 3500);
      });
  }
}

  //firstName, middleName, lastName, idNumber,nrdName,building, nrd, flatNumber



 saveReference() {
   const payload = { ...this.referenceOwner };

  if (payload.neighbourhood !== undefined && payload.neighbourhood !== null &&payload.neighbourhood!=="") {
    payload.neighbourhood = String(payload.neighbourhood);
  }

  if (payload.building !== undefined && payload.building !== null) {
    payload.building = String(payload.building);
  }

  if (payload.flatNumber !== undefined && payload.flatNumber !== null) {
    payload.flatNumber = String(payload.flatNumber);
  }

  console.log('final payload:', payload);
  if(payload.neighbourhood===""&& payload.flatNumber==="") {
   this.errorHandlerService.handleError("Please add building and flat number")
    return
  }
  this.authService.AddUPdateServiceProviderOwners(payload).subscribe({
    next: (res) => {
      this.isUpdate = false;
      this.resetReferenceForm();
      this.alertService.openSuccess('Service provider owners saved successfully');
      this.getAllServiceProviderOwners(this.serviceProvider.idNumber);
    },
    error: (err) => {
      console.log(err);
      this.errorHandlerService.handleError(err);
      this.cd.detectChanges();
    }
  });
}


resetReferenceForm() {
  this.referenceOwner = {
    id: 0,
    sProviderID: "",
    // hid: "",
    // ownerDetails: "",
    // isActive: true,
    residentReferenceName: "",
    building: "",
    neighbourhood: "",
    flatNumber: ""
  };
  this.reference1.reset();
}


 deleteReferenceData(element: any) {
  if (confirm(`Are you sure you want to delete ${element.residentReferenceName}?`)) {
    this.authService.deleteServiceProviderOwner(element.id).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Owner deleted successfully');
        this.getAllServiceProviderOwners(this.serviceProvider.idNumber); // refresh table
      },
      error: (err) => {
        console.error(err);
        this.errorHandlerService.handleError(err);
      }
    });
  }
}


onEnter(evt: any) {
  const selectedRef = this.residents.find(ref => ref.idNumber == evt.source.value);
  if (evt.source.selected && selectedRef) {
    const fullName = [selectedRef.firstName, selectedRef.middleName, selectedRef.lastName].join(" ").trim();
    this.reference1.patchValue(selectedRef.idNumber + " - " + selectedRef.shortName);
console.log(selectedRef,'selectedRef on Enter');

    this.referenceOwner.hid = selectedRef.idNumber;
    this.referenceOwner.residentReferenceName = fullName;
    // this.referenceOwner.ownerDetails = `${selectedRef.idNumber} - ${fullName}, ${selectedRef.nrdName} ${selectedRef.buildingName}-${selectedRef.flatNumber}`;
    this.referenceOwner.building = selectedRef.building.toString();
    this.referenceOwner.neighbourhood = selectedRef.nrd.toString();
    this.referenceOwner.flatNumber = selectedRef.flatNumber.toString();
  }
}


  displayNeighbourhood = (neighbourhood: any): string => {
    const match = this.neighbourhoodOptions?.find(opt => opt.id == neighbourhood)
    return match && match.name ? match.name : '';
  }

  displayServiceType = (serviceType: any): string => {
    const match = this.serviceTypeOptions?.find(opt => opt.id == serviceType)
    return match && match.name ? match.name : '';
  }

  displayBuilding = (building: any): string => {
    const match = this.buildingOptions?.find(opt => opt.id == building)
    return match && match.name ? match.name : '';
  }

  getServiceType() {
    this.authService.getServiceType().subscribe(res => {
      this.serviceTypeOptions = res;
    })
  }

  getBuildings() {
    this.authService.getBuildings().subscribe(res => {
      this.buildingOptions = res;
    })
  }

  getNeighbourhood() {
    this.authService.getNeighbourhood().subscribe(res => {
      this.neighbourhoodOptions = res;
    })
  }


  // ServiceProvider
  getServiceProviderById(id: number) {
    this.authService.getServiceProviderById(id).subscribe({
      next: (res) => {
        this.serviceProvider = res.owners[0];
        this.getAllServiceProviderOwners(this.serviceProvider.idNumber);
        this.referenceOwner.sProviderID = this.serviceProvider.idNumber;
        this.vehicleList = res.vehicles;
        this.dataToDisplayAAR = res.userAllAccess;

        if (this.serviceProvider.idNumber && this.serviceProvider.idNumber !== '0') {
          this.getImage(this.serviceProvider.idNumber)
        }
        this.showImageOnScreen()
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
    vehicle['tagUID'] = this.serviceProvider.idNumber;
    this.authService.postLandOwnerVehicle(vehicle).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Vehicle added successfully');
        this.getServiceProviderById(Number(this.serviceProvider.id));
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
        this.alertService.openSuccess('Vehicle updated successfully');
        this.getServiceProviderById(Number(this.serviceProvider.id));
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
        this.alertService.openSuccess('Vehicle deleted successfully');
        this.getServiceProviderById(Number(this.serviceProvider.id));
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
      concatMap((accessRight: AdditionalAccessRightsData) => {
        accessRight.cardHolderID = this.serviceProvider.idNumber
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
        this.getServiceProviderById(Number(this.serviceProvider.id));
      },
      error: (err) => {
      }
    });
  }

  updateAccessRights(accessRights: AdditionalAccessRightsData) {
    accessRights.cardHolderID = this.serviceProvider.idNumber;
    this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access rights updated successfully');
        this.getServiceProviderById(Number(this.serviceProvider.id));
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
        this.getServiceProviderById(Number(this.serviceProvider.id));
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }
  // Save Form

  saveServiceProvider() {
    this.serviceProvider.createdon = new Date().toISOString();
    this.serviceProvider.updatedon = new Date().toISOString();
    this.serviceProvider.shortName = this.serviceProvider.firstName + " " + this.serviceProvider.lastName;
    this.serviceProvider.id = 0;
    this.serviceProvider.idNumber = "";
    // let photo = this.serviceProvider.photo;
    let photo = this.serviceProvider.photo;
    //delete this.serviceProvider.photo;
    this.authService.postServiceProvider(this.serviceProvider).subscribe({
      next: (res) => {
        if (photo) {
          this.uploadImage(photo, res.iDnumber)
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
  uploadImage(selectedFile, idNumber) {
    this.authService.uploadImage(selectedFile, idNumber);
  }

  updateServiceProvider() {
    this.serviceProvider.updatedon = new Date().toISOString();
    this.serviceProvider.shortName = this.serviceProvider.firstName + " " + this.serviceProvider.lastName;
    let photo = this.photoPreview;

    this.authService.updateServiceProvider(this.serviceProvider).subscribe({
      next: (res) => {
        this.alertService.openSuccess(res.idNumber.toString() + ' Successfully Saved');
        if (this.selectedFile) {
          this.uploadImage(this.selectedFile, this.serviceProvider.idNumber)
        }
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  cancel() {
    this.serviceProvider = new ServiceProvider();
    this.authService.setLandOwnerData(this.serviceProvider, false);
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/service-provider' }
    });
  }

  ngOnDestroy(): void {
    this.serviceProvider = new ServiceProvider();
    this.authService.setLandOwnerData(this.serviceProvider, false);
  }
}

