import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from 'src/app/services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { AlertService } from 'src/app/services/alert.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-building',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './building.component.html',
  styleUrl: './building.component.scss'
})
export class BuildingComponent implements OnInit {

  buildingForm: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    parentID: new FormControl('', Validators.required),
    moduleType: new FormControl("Building", Validators.required),
    name: new FormControl("", Validators.required),
    discriminator: new FormControl(""),
    code: new FormControl("", Validators.required),
    typeID: new FormControl(3, Validators.required),
    isactive: new FormControl(true, Validators.required)
  })

  cityTypes = [{
    name: 'Riverview City',
    siteId: 1,
  }];
  neighbourhoodOptions: any[] = [];
  editMode: boolean = false;
  viewMode: boolean = false;

  constructor(
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getNeighbourhood();
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.editMode = true;
        const view = params['view'];
        if (view == 'true') {
          this.viewMode = true;
        }
        this.getBuildingById((Number)(id));
      }
    });
  }

  getBuildingById(id: number) {
    //this.editMode = true;
    this.authService.getBuildingById(id).subscribe({
      next: (res) => {
        this.editData(res[0]);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
    
  }

  onSave() {
    if(this.buildingForm.valid) {
      this.authService.postBuilding(this.buildingForm.value).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Successfully Saved');
          this.onCancel();
        },
        error: (err) => {
          this.errorHandlerService.handleError(err);
          this.cd.detectChanges();
        }
      });
    }
  }

  onUpdate() {
    if (this.buildingForm.valid) {
      this.authService.updateBuilding(this.buildingForm.value).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Successfully Updated');
          this.onCancel();
        },
        error: (err) => {
          this.errorHandlerService.handleError(err);
          this.cd.detectChanges();
        }
      });
    }
  }

  getNeighbourhood() {
    this.authService.getNeighbourhood().subscribe(res => {
      this.neighbourhoodOptions = res;
    })
  }
  
  onCancel() {
    this.editMode = false;
    this.buildingForm.patchValue({
      parentID: "",
      name: "",
      code:"",
      discriminator:"",
      id:0
    });
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/building' }
    });
  }

  editData(element) {
    // this.editMode = true;
    this.buildingForm.patchValue(element);
  }

  displayNeighbourhood = (neighbourhood: any): string => {
    const match = this.neighbourhoodOptions?.find(opt => opt.id == neighbourhood)
    return match && match.name ? match.name : '';
  }

  displayCityTypes = (city: any): string => {
    const match = this.cityTypes?.find(opt => opt.siteId == city)
    return match && match.name ? match.name : '';
  }
}