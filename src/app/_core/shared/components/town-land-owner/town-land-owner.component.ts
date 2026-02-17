import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../material/material.module';
import { DomSanitizer } from '@angular/platform-browser';
import { AuthService } from 'src/app/services/auth.service';
import { AutoCapitalizeFirstDirective} from '../../directives/capitalized.directive';

@Component({
  selector: 'app-town-land-owner',
  imports: [CommonModule, MaterialModule, FormsModule, AutoCapitalizeFirstDirective],
  templateUrl: './town-land-owner.component.html',
  styleUrl: './town-land-owner.component.scss'
})


export class TownLandOwnerComponent implements OnInit, OnChanges {
  // land owner
  @Input() landOwner;
  @Input() isTenant;
  @Input() isResident!: boolean;
  @Input() isContractor!: boolean;
  @Input() isEmployee!: boolean;
  @Input() isGuest!: boolean;
  @Input() isVisitor!: boolean;
  @Input() hideGovtIDFields: boolean = false;
  @Input() contractorOptions: any = [];
  disableFields: boolean = false;
  @Input() isViewOrEdit: boolean;
  neighbourhoodOptions: any[] = [];
  buildingOptions: any[] = [];
  projectOptions: any[] = [];
  companyOptions: any[] = [];
  residents: any[] = [];
  displaycompanyName:String;
  bloodGroupOptions: string[] = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  vehicleTypes: string[] = ['Two Wheeler', 'Four Wheeler', 'Three Wheeler'];
  selectedFile: File | null = null;
  @ViewChild('fileUpload') fileUpload: ElementRef;
  @Output() changeTenantType = new EventEmitter<number>();
  @Output() guestResident = new EventEmitter<string>();
  // fileUpload: ElementRef;

  photoPreview: string | ArrayBuffer | null = null;


  constructor(private sanitizer: DomSanitizer, private authService: AuthService) {

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
if (!Number(this.landOwner.idNumber)) {
  this.landOwner.photo = this.selectedFile;
return;
   }
  this.authService.uploadImage(this.selectedFile, this.landOwner.idNumber);
  }

  showImageOnScreen() {
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result;
       this.landOwner.photo = this.selectedFile
    };
    reader.readAsDataURL(this.selectedFile);
  }

  onPanChange(value: string): void {
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    this.landOwner.paNnumber = sanitized;
  }

  ngOnChanges(): void {
    if (this.isGuest || this.isVisitor) {
      this.filterResident()
    } 
    if (this.landOwner.idNumber && this.landOwner.idNumber !== '0') {
      this.getImage(this.landOwner.idNumber)
    }
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

  
  ngOnInit(): void {
  this.landOwner.idNumber = this.landOwner.idNumber || "0";
  // if (this.isContractor && !this.landOwner.neighbourhood) {
  //   this.landOwner.neighbourhood = [];
  // }
  if (this.isViewOrEdit) {
    this.disableFields = this.landOwner.isView;
  }
 if (this.landOwner.idNumber && this.landOwner.idNumber !== '0') {
      this.getImage(this.landOwner.idNumber)
    }
  if (this.isEmployee) {
    this.getProjects();
  } else if (this.isContractor) {
    this.getCompany();
    this.getProjects();
  } else if (this.isGuest || this.isVisitor) {
    this.getResident();
  }
  this.getBuildings();
  this.getNeighbourhood();
}



  getProjects() {
    this.projectOptions = [{
      name: 'Riverview City',
      siteId: 1,
    }]
  }

  tenantType(event:any) {
    let value = event.value
    this.changeTenantType.emit(value);
  }

  getResident() {
    this.authService.getResident().subscribe(res => {
      this.residents = [...res];
    })
  }

  filterResident() {
    if (this.isGuest || this.isVisitor) {
      if (this.landOwner.nrd && this.landOwner.building && this.landOwner.flatNumber) {
      const selectedRef = this.residents.find(ref =>
      ref.building == this.landOwner.building && ref.nrd == this.landOwner.nrd && ref.flatNumber == this.landOwner.flatNumber);
      if (selectedRef) {
        let fullName = [selectedRef.firstName, selectedRef.middleName, selectedRef.lastName].join(" ")
        if(this.isGuest) {
          this.landOwner.rid = selectedRef.idNumber
        } else {
          this.landOwner.hid = selectedRef.idNumber
        }
        this.landOwner.rname = selectedRef.idNumber + " - " + fullName;

      } else {
        if(this.isGuest) {
          this.landOwner.rid = "";
        } else {
          this.landOwner.hid = "";
        }
        this.landOwner.rname = "";
      }
    }
    }

  }

  getBuildings() {
    this.authService.getBuildings().subscribe(res => {
      this.buildingOptions = res;
    })
  }

  // getNeighbourhood() {
  //   this.authService.getNeighbourhood().subscribe(res => {
  //     this.neighbourhoodOptions = res;
  //   })
  // }
onServiceTypeChange(event: any): void {
  if (this.isContractor) {
    const selectedOption = this.contractorOptions?.find((opt: any) => opt.id === event.option.value);
    if (selectedOption) {
      this.landOwner.contactorType = selectedOption.id;
      this.landOwner.contractorTypeName = selectedOption.name;
    }
  }
}

//   getNeighbourhood() {
//   this.authService.getNeighbourhood().subscribe(res => {
//     this.neighbourhoodOptions = res || [];

//     // make sure it's always an array
//     if (!Array.isArray(this.landOwner.neighbourhood)) {
//       this.landOwner.neighbourhood = [];
//     }

//     // ✅ set default if nothing saved
//     if (
//       this.isContractor &&
//       this.landOwner.neighbourhood.length === 0 &&
//       this.neighbourhoodOptions.length > 0
//     ) {
//       this.landOwner.neighbourhood = [
//         this.neighbourhoodOptions[0].name
//       ];
//     }
//   });
// }


getNeighbourhood() {
  this.authService.getNeighbourhood().subscribe(res => {
    this.neighbourhoodOptions = res || [];

    if (
      this.isContractor &&
      !this.landOwner.neighbourhood &&   // null/undefined = new record
      this.neighbourhoodOptions.length > 0
    ) {
      this.landOwner.neighbourhood = this.neighbourhoodOptions[0].id; // ✅ set default
    }
  });
}



  getCompany() {
    this.authService.getCompany().subscribe(res => {
      this.companyOptions = res;
    })
  }

onClick(event: Event) {
  if (this.fileUpload) {
    this.fileUpload.nativeElement.click();
  }
}


  displayNeighbourhood = (neighbourhood: any): string => {
    const match = this.neighbourhoodOptions?.find(opt => opt.id == neighbourhood)
    return match && match.name ? match.name : '';
  }

  displayContractor = (contractor: any): string => {
    const match = this.contractorOptions?.find((opt: { id: any; }) => opt.id == contractor)
    return match && match.name ? match.name : '';
  }

  displayBuilding = (building: any): string => {
    const match = this.buildingOptions?.find(opt => opt.id == building)
    return match && match.name ? match.name : '';
  }

  displayProject = (project: any): string => {
    const match = this.projectOptions?.find(opt => opt.siteId == project)
    return match && match.name ? match.name : '';
  }

  displayCompanyName = (companyID: any): string => {
    const match = this.companyOptions?.find(opt => opt.id == companyID)
    return match && match.companyName ? match.companyName : '';
  }
}