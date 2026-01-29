import { Component, ElementRef, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogTitle, MatDialogContent, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MaterialModule } from '../../material/material.module';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';
import { AdditionalAccessRightsData, AddonCard, AddonDataSource, LandOwner, Vehicle } from 'src/app/models/common.model';

@Component({
  selector: 'app-addon-details',
  imports: [MaterialModule, FormsModule, CommonModule],
  templateUrl: './addon-details.component.html',
  styleUrl: './addon-details.component.scss'
})

export class AddonDetailsComponent implements OnInit {
  addonData= new AddonCard();;
    landowner: LandOwner = new LandOwner();
  photoPreview: string | ArrayBuffer | null = null;
    photoPreviewAddOn: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  @ViewChild('fileUpload') fileUpload: ElementRef;
    addonCardList: AddonCard[] = [];
    vehicleList: Vehicle[] = [];
      dataToDisplayAAR: AdditionalAccessRightsData[] = [];
      
    
    // dataSourceVehicle = new AddonDataSource(this.vehicleList);
    // add access rights
  isView: boolean = true;
  tenantType!: number;
  constructor(private dialogRef: MatDialogRef<AddonDetailsComponent>, private authService: AuthService) {
    // console.log("addonData", this.addonData)
  }
  ngOnInit(): void {
    // console.log("addonData", this.addonData)
    this.authService.getImage(this.addonData.idNumber).subscribe({
      next: (event: any) => {
        if (event.base64) {
          // this.photoPreview = event.base64;
          this.photoPreviewAddOn = event.base64;
        }
      },
      error: (err) => {
        console.error('Upload failed:', err);
      }
    });
  }
  updateaddonData() {
    this.dialogRef.close(this.addonData);
  }

  cancel() {
    this.dialogRef.close();
  }


  //new funs for img upload and view in edit addon
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
    if (!Number(this.addonData.idNumber)) {
      this.addonData.photo = this.selectedFile;
      return;
    }
    this.authService.uploadImage(this.selectedFile, this.addonData.idNumber);
  }

  showImageOnScreen() {
    const reader = new FileReader();
    reader.onload = () => {
      this.photoPreview = reader.result;
      //this.landOwner.photo = this.selectedFile
    };
    reader.readAsDataURL(this.selectedFile);
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

  onClick(event: Event) {
  if (this.fileUpload) {
    this.fileUpload.nativeElement.click();
  }
}
  getLandownerById(id: number) {
    this.authService.getLandOwnerById(id).subscribe({
      next: (res) => {
        this.landowner = res.owners[0];
        this.addonCardList = res.dependentOwners;
        this.vehicleList = res.vehicles;
        this.dataToDisplayAAR = res.userAllAccess;
      },
      // error: (err: any) => {
      //   this.errorHandlerService.handleError(err);
      //   this.cd.detectChanges();
      // }
    });
  }
 updateAddOnTable(addonCard: any) {
    // this.dataToDisplay = event; 
    addonCard.mobileNo = addonCard.mobileNo.toString();
    this.authService.updateLandOwnerAddonCard(addonCard).subscribe({
      next: (res) => {
        // this.alertService.openSuccess('Successfully Updated');
        this.getLandownerById(Number(this.landowner.id));
      },
      // error: (err: any) => {
      //   this.errorHandlerService.handleError(err);
      //   this.cd.detectChanges();
      // }
    });
  }
    uploadImage(selectedFile, idnumber) {
    this.authService.uploadImage(selectedFile, idnumber);
  }
   updateLandOwner() {
    this.landowner.shortName = this.landowner.firstName + " " + this.landowner.lastName
    this.authService.updateLandOwnerAddonCard(this.landowner).subscribe({
      next: (res) => {
        // this.alertService.openSuccess('Successfully Saved');
        
         if (this.landowner.photo!=null ) {
          this.uploadImage(this.landowner.photo, this.landowner.idNumber)
        }
      },
      
      // error: (err: any) => {
      //   this.errorHandlerService.handleError(err);
      //   this.cd.detectChanges();
      // }
    });
    this.dialogRef.close(this.addonData)
    this.addonCardList.forEach((element) => {
      element.pid = Number(this.landowner.id);
      element.mobileNo = element.mobileNo.toString();
    });
  }
}
