import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, concatMap, EMPTY, from } from 'rxjs';
import { TownAddAccessRightsComponent } from 'src/app/_core/shared/components/town-add-access-rights/town-add-access-rights.component';
import { TownLandOwnerComponent } from 'src/app/_core/shared/components/town-land-owner/town-land-owner.component';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AdditionalAccessRightsData, AddonDataSource, Visitor } from 'src/app/models/common.model';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';

@Component({
  selector: 'app-visitor',
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    TownLandOwnerComponent,
    TownAddAccessRightsComponent
  ],
  templateUrl: './visitor.component.html',
  styleUrls: ['../../../../table.css']
})
export class VisitorComponent implements OnInit {

  visitor: Visitor = new Visitor();
  isViewOrEdit: boolean = false;
  files: File[] = [];

  addAccessRights = new AdditionalAccessRightsData();
  dataToDisplayAAR: AdditionalAccessRightsData[] = [];
  dataSourceAAR = new AddonDataSource(this.dataToDisplayAAR);

  photoPreview: string | ArrayBuffer | null = null;  constructor(private authService: AuthService,
    private cd: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute) {
  }

  onClickAddon(): void {
    // Trigger file input manually if needed
  }

  ngOnInit() {
     if (this.visitor.idNumber && this.visitor.idNumber !== '0') {
      this.getImage(this.visitor.idNumber)
    }
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isViewOrEdit = true;
        this.getVisitorById((Number)(id));

      } else {
        this.isViewOrEdit = false;
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.files.push(...Array.from(input.files)); 
    }
  }

  removeFile(event: Event, file: File): void {
    this.files = this.files.filter(f => f !== file);
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

  getVisitorById(id: number) {
    this.authService.getVisitorById(id).subscribe({
      next: (res) => {
        this.visitor = res.owners[0];
        console.log("before", this.visitor)
        this.visitor.visitStartDate = this.getISODate(this.visitor.visitStartTime);
        this.visitor.visitEndDate = this.getISODate(this.visitor.visitEndTime);
        this.visitor.visitStartTime = this.getTime(this.visitor.visitStartTime);
        this.visitor.visitEndTime = this.getTime(this.visitor.visitEndTime);
       
        this.dataToDisplayAAR = res.userAllAccess;
        console.log("after", this.visitor)
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  getISODate(datetime: string) {
    if (datetime) {
      const date = new Date(datetime);
      return date.toISOString().split('T')[0];
    }
    return "";
    
  }

  getTime(datestr: string) {
    if (datestr) {
      const date  = new Date(datestr);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`
    }
    return "";
    
  }
  //Added for Images by NB
 uploadImage(selectedFile, idNumber) {
    this.authService.uploadImage(selectedFile, idNumber);
  }


  cancel() {
    this.visitor = new Visitor();
    this.authService.setLandOwnerData(this.visitor, false);
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/visitor' }
    });
  }

  onSave(): void {
    if (this.visitor.hid) {
      this.visitor.nrd = this.visitor.nrd.toString();
      this.visitor.building = this.visitor.building.toString();
      this.visitor.visitStartTime = this.combineDateAndTime(this.visitor.visitStartDate, this.visitor.visitStartTime)
      this.visitor.visitEndDate = this.visitor.visitStartDate;
      this.visitor.visitEndTime = this.visitor.visitStartTime;
      this.visitor.shortName = this.visitor.firstName +  " " + this.visitor.lastName ;
      console.log(this.visitor);
       let photo = this.visitor.photo; 
    delete this.visitor.photo;
      this.authService.postVisitor(this.visitor).subscribe({
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
          console.log(err);
          this.errorHandlerService.handleError(err);
          this.cd.detectChanges();
        }
      });
    } else {
      this.errorHandlerService.handleError({message: "Resident not found"});
    }
  }

  combineDateAndTime(dateStr: string, timeStr: string): string {
  if (dateStr && timeStr) {
    const date = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    date.setHours(hours, minutes, 0, 0);

    return date.toISOString();
  }
  return "";
  
 }


  onUpdate(): void {
    if (this.visitor.hid) {
      this.visitor.nrd = this.visitor.nrd.toString();
      this.visitor.building = this.visitor.building.toString();
      this.visitor.visitStartTime = this.combineDateAndTime(this.visitor.visitStartDate, this.visitor.visitStartTime)
      this.visitor.visitEndTime = this.combineDateAndTime(this.visitor.visitEndDate, this.visitor.visitEndTime)
      this.visitor.shortName = this.visitor.firstName +  " " + this.visitor.lastName;
      console.log(this.visitor);
      let photo = this.visitor.photo;
      delete this.visitor.photo;
      this.authService.updateVisitor(this.visitor).subscribe({
      next: (res) => {
        if (photo) {
          this.uploadImage(photo, res.idNumber || this.visitor.idNumber);
        }
        
        this.getVisitorById(Number(this.visitor.id));
        this.alertService.openSuccess('Successfully Saved');
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
      });
    } else {
      this.errorHandlerService.handleError({message: "Resident not found"});
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
    accessRights.cardHolderID = this.visitor.idNumber;
    this.authService.updateLandOwnerAccessRights(accessRights).subscribe({
      next: (res) => {
        this.alertService.openSuccess('Access rights updated successfully');
        this.getVisitorById(Number(this.visitor.id));
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
        accessRight.cardHolderID = this.visitor.idNumber
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
        this.getVisitorById(Number(this.visitor.id));
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
        this.getVisitorById(Number(this.visitor.id));
      },
      error: (err: any) => {
        console.log(err);
        this.errorHandlerService.handleError(err);
        this.cd.detectChanges();
      }
    });
  }

  setRequiredFields(addonCard) {
    addonCard.pid = Number(this.visitor.id);
    addonCard.mobileNo = addonCard.mobileNo.toString();
    addonCard.logicalDeleted = 0;
    addonCard.building = this.visitor.building;
    addonCard.nrd = this.visitor.nrd;
  }
}
