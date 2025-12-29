import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AuthService } from 'src/app/services/auth.service';
import { AlertService } from 'src/app/services/alert.service';
import { ErrorHandlerService } from 'src/app/services/error-handler.service';

@Component({
  selector: 'app-reader-location',
  templateUrl: './reader-location.component.html',
  styleUrls: ['./reader-location.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    RouterModule
  ]
})
export class ReaderLocationComponent {
  editMode = false;
  viewMode = false;

  locationForm: FormGroup = new FormGroup({
    id: new FormControl(0,Validators.required),
    name: new FormControl('', Validators.required),
    code: new FormControl('', Validators.required),
    typeID: new FormControl(10, Validators.required),
    parentID: new FormControl(1, Validators.required),
    moduleType: new FormControl('LOC', Validators.required),
    discriminator: new FormControl('LOC', Validators.required),
    createdby: new FormControl(1),
    updatedby: new FormControl(1),
    isActive: new FormControl(true)
  });

  neighbourhoodOptions: any[] = [];

  constructor(
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private alertService: AlertService,
    private errorHandlerService: ErrorHandlerService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getNeighbourhood();

    this.activatedRoute.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.editMode = true;
        this.viewMode = params['view'] === 'true';
        this.getReaderLocationByID(+id);
      }
    });
  }

  getNeighbourhood() {
    this.authService.getNeighbourhood().subscribe(res => this.neighbourhoodOptions = res);
  }

  displayNeighbourhood = (neighbourhood: any): string => {
    const match = this.neighbourhoodOptions.find(opt => opt.id === neighbourhood);
    return match ? match.name : '';
  }

  getReaderLocationByID(id: number) {
    this.authService.getReaderLocationById(id).subscribe({
      next: res => this.locationForm.patchValue(res[0]),
      error: err => this.errorHandlerService.handleError(err)
    });
  }

  onSave() {
    if (!this.locationForm.valid) {
      console.warn("Form Invalid:", this.locationForm.value);
      return;
    }

    const payload = this.locationForm.value;
    console.log("Payload before sending:", payload);

    this.authService.postReaderLocation(payload).subscribe({
      next: res => {
        this.alertService.openSuccess('Successfully Saved');
        this.onCancel();
      },
      error: err => {
        if (err.status === 400 && err.error === 'Reader Location Already Exists.') {
          this.alertService.openError('This Reader Location already exists. Please use a different name or code.');
        } else {
          this.errorHandlerService.handleError(err);
        }
        this.cd.detectChanges();
      }
    });
  }

  onCancel() {
    this.router.navigate(['/search'], { queryParams: { returnPath: '/master/reader-location' } });
  }
}
