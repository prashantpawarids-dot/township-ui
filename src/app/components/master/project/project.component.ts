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
  selector: 'app-project',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './project.component.html',
  styleUrl: './project.component.scss'
})
export class ProjectComponent implements OnInit {

  projectForm: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    projectCode: new FormControl("", Validators.required),
    projectName: new FormControl("", Validators.required),
    companyID: new FormControl("", Validators.required),
    company: new FormControl(null),
    isactive: new FormControl(true),
    isdeleted: new FormControl(false),
  })

  companyOptions: any[] = [];
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
    this.getCompany();
    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.editMode = true;
        const view = params['view'];
        if (view == 'true') {
          this.viewMode = true;
        }
        this.getProjectById((Number)(id));
      }
    });
  }

  getProjectById(id: number) {
    this.editMode = true;
    this.authService.getProjectById(id).subscribe({
      next: (res) => {
        this.editData(res[0]);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
    
  }

  onSave() {
    if(this.projectForm.valid) {
      this.authService.postProject(this.projectForm.value).subscribe({
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
    if (this.projectForm.valid) {
      this.authService.updateProject(this.projectForm.value).subscribe({
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

  getCompany() {
    this.authService.getCompany().subscribe(res => {
      this.companyOptions = res;
    })
  }
  
  onCancel() {
    this.editMode = false;
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/project' }
    });
  }

  editData(element) {
    this.editMode = true;
    this.projectForm.patchValue(element);
  }

  displayCompanyName = (companyID: any): string => {
    const match = this.companyOptions?.find(opt => opt.id == companyID)
    return match && match.companyName ? match.companyName : '';
  }

}

