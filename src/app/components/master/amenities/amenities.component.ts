import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-amenities',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './amenities.component.html',
  styleUrl: './amenities.component.scss'
})
export class AmenitiesComponent implements OnInit {
  userForm: any;
  constructor(private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {

  }
  // cityTypes = [{
  //   name: 'Riverview City',
  //   siteId: 1,
  // }];
  companyOptions: any[] = [];
  projectOptions: any[] = [];
  editMode: boolean = false;
  viewMode: boolean = false;
  amenitiesForm: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    parentID: new FormControl("projectID", Validators.required),
    moduleType: new FormControl("AMT", Validators.required),
    name: new FormControl("", Validators.required),
    discriminator: new FormControl("AMT", Validators.required),
    code: new FormControl("", Validators.required),
    typeID: new FormControl(8, Validators.required),
    isactive: new FormControl(true, Validators.required),
    companyID: new FormControl(1, Validators.required)
  })
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
    //this.getCompany();
    this.getProject();

    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.editMode = true;
        const view = params['view'];
        if (view == 'true') {
          this.viewMode = true;
        }
        this.getAmenitiesById((Number)(id));

      }
    });
  }

  getAmenitiesById(id: number) {
    this.authService.getAmenitiesById(id).subscribe({
      next: (res) => {
        this.editData(res[0]);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }

  onSave() {
    if(this.amenitiesForm.valid) {
      this.authService.postAmenities(this.amenitiesForm.value).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Successfully Saved');
          this.onCancel();
        },
        error: (err: any) => {
          this.errorHandlerService.handleError(err);
        }
      });
    }
    // Add your save logic here
  }


  onUpdate() {
        if(this.amenitiesForm.valid) {
      this.authService.updateAmenities(this.amenitiesForm.value).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Successfully Updated');
          this.onCancel();
        },
        error: (err: any) => {
          this.errorHandlerService.handleError(err);
        }
      });
    }
    // Add your update logic here
  }

  onCancel() {
    this.editMode = false;
    this.amenitiesForm.patchValue({
      parentID: "",
      name: "",
      code:"",
      id:0
    });
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/amenities' }
    });
  }

  getCompany() {
    this.authService.getCompany().subscribe(res => {
      this.companyOptions = res;
    })
  }

  // displayCompanyName = (companyID: any): string => {
  //   const match = this.companyOptions?.find(opt => opt.id == companyID)
  //   return match && match.companyName ? match.companyName : '';
  // }

  editData(element) {
    this.amenitiesForm.patchValue({
      parentID: element.parentID,
      name: element.name,
      code: element.code,
      id: element.id,
      companyID: 1
    });
  }

}
