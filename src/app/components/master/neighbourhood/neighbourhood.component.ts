import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { AlertService } from 'src/app/services/alert.service';


export interface Neighbourhood {
  "id": number,
  "name": string,
  "code": string,
  "typeID": number,
  "parentID": number,
  "moduleType": string,
  "discriminator": string | null,
  "isactive": boolean,
  "createdby": number | null,
  "createdon": Date,
  "updatedby": number | null,
  "updatedon": Date
}

@Component({
  selector: 'app-neighbourhood',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './neighbourhood.component.html',
  styleUrl: './neighbourhood.component.scss'
})
export class NeighbourhoodComponent implements OnInit {
  constructor(private authService: AuthService,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {

  }
  cityTypes = [{
    name: 'Riverview City',
    siteId: 1,
  }];
  editMode: boolean = false;
  viewMode: boolean = false;
   companyOptions: any[] = [];
  neighbourhoodForm: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    parentID: new FormControl(''),
    moduleType: new FormControl("NRD", Validators.required),
    name: new FormControl("", Validators.required),
    code: new FormControl("", Validators.required),
    typeID: new FormControl(2, Validators.required),
    isactive: new FormControl(true, Validators.required),
    discriminator: new FormControl(""),
  })
  ngOnInit() {
     this.getCompany();
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params
      ['id'];
      if (id) {
        this.editMode = true;
        const view = params['view'];
        if (view == 'true') {
          this.viewMode = true;
        }
        this.getNeighbourhoodById((Number)(id));
      }
    });
  }

  getNeighbourhoodById(id: number) {
    this.authService.getNeighbourhoodById(id).subscribe({
      next: (res) => {
        this.editData(res[0]);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }

  onSave() {
    if(this.neighbourhoodForm.valid) {
      this.authService.postNeighbourhood(this.neighbourhoodForm.value).subscribe({
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
    if(this.neighbourhoodForm.valid) {
      this.authService.updateNeighbourhood(this.neighbourhoodForm.value).subscribe({
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
    this.neighbourhoodForm.patchValue({
      parentID: "",
      name: "",
      code:"",
      id:0
    });
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/neighbourhood' }
    });
  }

  displayCityTypes = (neighbourhood: any): string => {
    const match = this.cityTypes?.find(opt => opt.siteId == neighbourhood)
    return match && match.name ? match.name : '';
  }

  getCompany() {
    this.authService.getCompany().subscribe(res => {
      this.companyOptions = res;
    })
  }

   displayCompanyName = (companyID: any): string => {
    const match = this.companyOptions?.find(opt => opt.id == companyID)
    return match && match.companyName ? match.companyName : '';
  }


  editData(element) {
    this.neighbourhoodForm.patchValue({
      parentID: element.parentID,
      name: element.name,
      code: element.code,
      id: element.id
    });
  }

}
