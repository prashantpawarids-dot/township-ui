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
  selector: 'app-camera',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './camera.component.html',
  styleUrl: './camera.component.scss'
})
export class CameraComponent implements OnInit {

  // cameraForm: FormGroup = new FormGroup({
  //   id: new FormControl(0),
  //   anprTerminalID: new FormControl('', Validators.required),
  //   anprip: new FormControl('', Validators.required),
  //   anprport: new FormControl(''),
  //   anprlocation: new FormControl('', Validators.required),
  //   anprmode: new FormControl('IN', Validators.required),
  //   isactive: new FormControl(true)
  // })


    cameraForm: FormGroup = new FormGroup({
    id: new FormControl(0),
    anprTerminalID: new FormControl('', Validators.required),
    anprip: new FormControl('', Validators.required),
    anprport: new FormControl(''),
    anprlocation: new FormControl('', Validators.required),
    anprmode: new FormControl('IN', Validators.required),
    isactive: new FormControl(true),
    status: new FormControl('Disconnected')
  })

  modeOptions = ['IN', 'OUT'];
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
        this.getCameraById(Number(id));
      }
    });
  }

  getCameraById(id: number) {
    this.authService.getCameras().subscribe({
      next: (res) => {
        const match = res.find((c: any) => c.id === id);
        if (match) this.editData(match);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }

  onSave() {
    if (this.cameraForm.valid) {
      this.authService.postCamera(this.cameraForm.value).subscribe({
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
    if (this.cameraForm.valid) {
      this.authService.updateCamera(this.cameraForm.value).subscribe({
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
    this.cameraForm.reset({
      id: 0,
      anprTerminalID: '',
      anprip: '',
      anprport: '',
      anprlocation: '',
      anprmode: 'IN',
      isactive: true
    });
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/camera' }
    });
  }

  editData(element) {
    this.cameraForm.patchValue(element);
  }
}