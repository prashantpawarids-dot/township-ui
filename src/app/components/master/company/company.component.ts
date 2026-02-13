import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
@Component({
  selector: 'app-company',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './company.component.html',
  styleUrl: './company.component.scss'
})
export class CompanyComponent implements OnInit {

  constructor(
    private authService: AuthService,
      private cd: ChangeDetectorRef,
      private errorHandlerService: ErrorHandlerService,
      private alertService: AlertService,
      private router: Router,
      private activatedRoute: ActivatedRoute) {}

  companyForm: FormGroup = new FormGroup({
      id: new FormControl(0, Validators.required),
      // comanyCode: new FormControl(""),
     comanyCode: new FormControl("", Validators.required),

      
      companyName: new FormControl("", Validators.required),
      city: new FormControl(""),
      address: new FormControl(""),
      gsTnumber: new FormControl(""),
      pannumber: new FormControl(""),
      mobileNo: new FormControl(""),
      landLine: new FormControl(""),
      contactPerson: new FormControl(""),
      contactMobile: new FormControl(""),
      isactive: new FormControl(true),
    })
    editMode: boolean = false;
    viewMode: boolean = false;

    

    ngOnInit(): void {
      this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.editMode = true;
        const view = params['view'];
        if (view == 'true') {
          this.viewMode = true;
        }
        this.getCompanyById((Number)(id));
      }
    });
      
    }

    getCompanyById(id: number) {
      this.authService.getCompanyById(id).subscribe({
        next: (res) => {
          this.editData(res[0]);
        },
        error: (err: any) => {
          this.errorHandlerService.handleError(err);
        }
      });
    }

    editData(element) {
      this.companyForm.patchValue(element);
    }

   onSave(): void {
    if(this.companyForm.valid) {
      this.authService.postCompany(this.companyForm.value).subscribe({
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
    if (this.companyForm.valid) {
      this.authService.updateCompany(this.companyForm.value).subscribe({
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

  onCancel(): void {
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/company' }
    });
  }
}
