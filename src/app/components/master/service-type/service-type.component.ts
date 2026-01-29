import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { AlertService } from 'src/app/services/alert.service';

@Component({
  selector: 'app-service-type',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './service-type.component.html',
  styleUrl: './service-type.component.scss'
})
export class ServiceTypeComponent implements OnInit {

  ServiceTypeForm: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    parentID: new FormControl(1, Validators.required),
    moduleType: new FormControl("STP", Validators.required),
    name: new FormControl("", Validators.required),
    discriminator: new FormControl("", Validators.required),
    code: new FormControl("0"),
    typeID: new FormControl(13, Validators.required),
    isactive: new FormControl(true, Validators.required)
  })

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
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.editMode = true;
        const view = params['view'];
        if (view == 'true') {
          this.viewMode = true;
        }
        this.getServiceTypeById((Number)(id));
      }
    });
  }

  getServiceTypeById(id: number) {
    this.authService.getServiceTypeById(id).subscribe({
      next: (res) => {
        this.editData(res[0]);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
    
  }

  onSave() {
    if(this.ServiceTypeForm.valid) {
      this.authService.postServiceType(this.ServiceTypeForm.value).subscribe({
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
    if (this.ServiceTypeForm.valid) {
      console.log(this.ServiceTypeForm.value)
      this.authService.updateServiceType(this.ServiceTypeForm.value).subscribe({
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
  
  onCancel() {
    this.editMode = false;
    this.ServiceTypeForm.patchValue({
      parentID: "",
      name: "",
      code:"",
      discriminator:"",
      id:0
    });
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/service-type' }
    });
  }

  editData(element) {
    this.ServiceTypeForm.patchValue(element);
  }
}
