import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormGroup, Validators, FormControl } from '@angular/forms';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { AlertService } from 'src/app/services/alert.service';
@Component({
  selector: 'app-user',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule,
    MatDialogModule
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit{

  constructor(private authService: AuthService,
      private errorHandlerService: ErrorHandlerService,
      private alertService: AlertService,
      private router: Router,
      private activatedRoute: ActivatedRoute,
      ) {}

   companyOptions: any[] = [];
  editMode: boolean = false;
  viewMode: boolean = false;
   projectOptions: any[] = [];
  userForm: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    name: new FormControl('', Validators.required),
    uid: new FormControl("", Validators.required),
    password: new FormControl("", Validators.required),
    email: new FormControl("", Validators.required),
    phone: new FormControl("", Validators.required),
    isactive: new FormControl(true, Validators.required),
    isdeleted: new FormControl(false, Validators.required),
    projectID: new FormControl("1", Validators.required),
    companyID: new FormControl("", Validators.required),
    project: new FormControl(""),
    createdby: new FormControl(0),
    updatedon: new FormControl(null),
    updatedby: new FormControl(0),
    createdon: new FormControl(null),
    roleID: new FormControl(null),
    role: new FormControl(null),
  });
  getCompany() {
    this.authService.getCompany().subscribe(res => {
      this.companyOptions = res;
    })
  }

  displayCompanyName = (companyID: any): string => {
    const match = this.companyOptions?.find(opt => opt.id == companyID)
    return match && match.companyName ? match.companyName : '';
  }

  ngOnInit() {
    this.getCompany();
    this.getProject();
    this.activatedRoute.queryParams.subscribe(params => {
      
      const id = params['id'];
      if (id) {
        this.editMode = true;
        const view = params['view'];
        if (view === 'true') {
          this.viewMode = true;
        }
        this.getUserById(Number(id));
      }
    });
}

  getUserById(id: number) {
    this.authService.getUserById(id).subscribe({
      next: (res) => {
        this.editData(res);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
    
  }

  onSave() {
    console.log(this.userForm.value);
    if (this.userForm.valid) {
       const selectedId = this.userForm.value.projectID;
    const selected = this.projectOptions.find(p => p.id == selectedId);

    this.userForm.patchValue({
      project: selected ? selected.projectName : ''
    });
      this.userForm.patchValue({
        createdon: new Date().toISOString(),
      });
      this.authService.addUser(this.userForm.value).subscribe({
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
    if (this.userForm.valid) {
      this.userForm.patchValue({
        updatedon: new Date().toISOString(),
      });
      this.authService.updateUserById(this.userForm.value).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Successfully Updated');
          this.onCancel();
        },
        error: (err: any) => {
          this.errorHandlerService.handleError(err);
        }
      });
    }
  }

  getProject() {
    this.authService.getProject().subscribe(res => {
      this.projectOptions = res;
    });
  }

  editData(res: any) {
    this.userForm.patchValue(res)
  }

  onCancel() {
    this.editMode = false;
    this.userForm.reset();
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/user' }
    });
  }

  displayProjectName = (projectName: string): string => {
    const match = this.projectOptions?.find(opt => opt.id == projectName)
    this.userForm.patchValue(match.projectName)
    return match && match.projectName ? match.projectName : '';
  }

}
