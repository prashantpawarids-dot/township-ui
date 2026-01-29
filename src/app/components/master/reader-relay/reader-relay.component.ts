import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AlertService } from 'src/app/services/alert.service';
import { AuthService } from 'src/app/services/auth.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-reader-relay',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    FormsModule,
    RouterModule,
    MatToolbarModule,
    MatMenuModule
  ],
  templateUrl: './reader-relay.component.html',
  styleUrls: ['./reader-relay.component.scss']
})
export class ReaderRelayComponent {

  editMode: boolean = false;

  readerForm: FormGroup = new FormGroup({
    id: new FormControl(0, Validators.required),
    code: new FormControl('', Validators.required),
    readerip: new FormControl('', Validators.required),
    readerport: new FormControl('', Validators.required),
    readermode: new FormControl('', Validators.required),
    // readerLocation: new FormControl('', Validators.required),
    readerLocation: new FormControl(''), // remove Validators.required
    readertype: new FormControl('', Validators.required),
    isActive: new FormControl(null, Validators.required),
    isDeleted: new FormControl(null, Validators.required)
  });
  viewMode: boolean;
locations: any[] = [];

  private baseUrl = environment.apiurl; // Replace with your API URL

  constructor(
    private router: Router,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private errorHandlerService: ErrorHandlerService,
    private alertService: AlertService,
    private activatedRoute: ActivatedRoute
  ) { }
  
//  editData(element) {
//     this.editMode = true;
//     this.readerForm.patchValue(element);
//   }

editData(element) {
  this.editMode = true;
  this.readerForm.patchValue(element);
}

    ngOnInit(): void {
        this.loadLocation();

    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.editMode = true;
        const view = params['view'];
        if (view == 'true') {
          this.viewMode = true;
        }
        this.getReaderByID((Number)(id));
      }
    });
  }

  // ===============================
  // Fetch single reader and populate form
  // ===============================
  getReaderByID(id: number) {
      this.editMode = true;
    this.authService.getReaderById(id).subscribe({
      next: (res) => {
        this.editData(res[0]);
      },
      error: (err: any) => {
        this.errorHandlerService.handleError(err);
      }
    });
  }

  loadLocation() {
  this.authService.getReaderLocation().subscribe({
    next: (data) => {
      this.locations = data;
      // console.log('Location JSON:', JSON.stringify(this.locations, null, 2));

    },
    error: (err) => {
      console.error(err);
    }
  });
}


  //  onUpdate() {
  //   if (this.readerForm.valid) {
  //     this.authService.updateReader(this.readerForm.value).subscribe({
  //       next: (res) => {
  //         this.alertService.openSuccess('Successfully Updated');
  //         this.onCancel();
  //       },
  //       error: (err) => {
  //         this.errorHandlerService.handleError(err);
  //         this.cd.detectChanges();
  //       }
  //     });
  //   }
  // }
onUpdate() {
  if (this.readerForm.valid) {
    const payload = this.readerForm.value;

    // Prevent non-admin from un-deleting
    const roleId = localStorage.getItem('roleid');
    if (roleId !== '1' && payload.isDeleted === false) {
      // If record was deleted, non-admin cannot revoke
      this.alertService.openError('Only admin can revoke deleted records.');
      return;
    }

    this.authService.updateReader(payload).subscribe({
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

  // ===============================
  // Save reader data
  // ===============================
  onSave() {
    if (this.readerForm.valid) {
      const payload = this.readerForm.value;
      console.log("Payload before sending:", payload);

      this.authService.postReader(payload).subscribe({
        next: (res) => {
          this.alertService.openSuccess('Successfully Saved');
          this.onCancel();
        },
        error: (err) => {
          this.errorHandlerService.handleError(err);
          this.cd.detectChanges();
        }
      });
    } else {
      console.warn("Form Invalid:", this.readerForm.value);
    }
  }

  // ===============================
  // Cancel / navigate back
  // ===============================
  onCancel() {
    this.router.navigate(['/search'], {
      queryParams: { returnPath: '/master/reader-relay' }
    });
  }

}
