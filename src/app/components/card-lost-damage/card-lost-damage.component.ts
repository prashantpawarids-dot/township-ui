// import { CommonModule } from '@angular/common';
// import { Component } from '@angular/core';
// import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MatAutocompleteModule } from '@angular/material/autocomplete';
// import { MatButtonModule } from '@angular/material/button';
// import { MatNativeDateModule } from '@angular/material/core';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatRadioModule } from '@angular/material/radio';
// import { MatSelectModule } from '@angular/material/select';
// import { MaterialModule } from 'src/app/_core/shared/material/material.module';

// @Component({
//   selector: 'app-card-lost-damage',
//   standalone: true,
//   imports: [
//     FormsModule,
//     CommonModule,
//     ReactiveFormsModule,
//     MatFormFieldModule,
//     MatSelectModule,
//     MatAutocompleteModule,
//     MatInputModule,
//     MatNativeDateModule,
//     MatButtonModule,
//     MatRadioModule,
//     MaterialModule
//   ],
//   templateUrl: './card-lost-damage.component.html',
//   styleUrl: './card-lost-damage.component.scss'
// })
// export class CardLostDamageComponent {

//   cardForm: FormGroup;

//   searchType: string = '';

//   searchByOptions = [
//     { name: 'Card Number' },
//     { name: 'ID Number' },
//     { name: 'ShortName Name' },
//     // add more options as needed
//   ];

//   cardTypes = [
//     { value: 'Resident', label: 'Resident' },
//     { value: 'Tenant', label: 'Tenant' },
//     { value: 'Service provider', label: 'Service provider' },
//     { value: 'Contractor Employee', label: 'Contractor Employee' },
//     { value: 'Nanded Employee', label: 'Nanded Employee' },
//     { value: 'Land Owner', label: 'Land Owner' },
//     { value: 'Guest', label: 'Guest' }
//   ];

//   constructor(private fb: FormBuilder) {
//     this.cardForm = this.fb.group({
//       liableType: [''],
//       cardType: [''],
//       searchType: [''],
//       searchData: ['']
//     });
//   }

//   // showAll() {
//   //   console.log('Form Values:', this.cardForm.value);
//   // }

//   search(){
//     console.log('Form Values:', this.cardForm.value);
//   }

//   update(){
//     console.log('Form Values:', this.cardForm.value);
//   }
// }


import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-card-lost-damage',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatRadioModule,
    MaterialModule
  ],
  templateUrl: './card-lost-damage.component.html',
  styleUrl: './card-lost-damage.component.scss'
})
export class CardLostDamageComponent {

  cardForm: FormGroup;
  updateForm: FormGroup;

  tableData: any[] = [];
  showUpdatePopup = false;

  selectedId!: number;
  selectedCsn!: string;

  searchByOptions = [
    { name: 'ID Number', key: 'idNumber' },
    { name: 'Short Name', key: 'shortname' },
    { name: 'Card Number', key: 'csn' }
  ];

  cardTypes = [
    { value: 'Resident', label: 'Resident' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'Service provider', label: 'Service provider' },
    { value: 'Contractor Employee', label: 'Contractor Employee' },
    { value: 'Nanded Employee', label: 'Nanded Employee' },
    { value: 'Land Owner', label: 'Land Owner' },
    { value: 'Guest', label: 'Guest' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.cardForm = this.fb.group({
      cardType: [''],
      searchType: [''],
      searchData: ['']
    });

    this.updateForm = this.fb.group({
      idNumber: [{ value: '', disabled: true }],
      lostDamageType: [''],
      reporteddate: [''],
      description: ['']
    });
  }

  // SEARCH
  search() {
    const searchValue = this.cardForm.value.searchData;
    const searchType = this.cardForm.value.searchType;

    if (!searchValue || !searchType) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select search type and enter search value',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    this.authService.searchCardHolder(searchValue).subscribe(res => {
      // Apply startsWith filter based on selected search type
      this.tableData = res.filter((item: any) => {
        const fieldValue = item[searchType]?.toString().toLowerCase() || '';
        const searchLower = searchValue.toLowerCase();
        return fieldValue.startsWith(searchLower);
      });

      if (this.tableData.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No Results',
          text: 'No records found matching your search criteria',
          confirmButtonColor: '#1976d2'
        });
      }
    });
  }

  // OPEN UPDATE POPUP
  openUpdate(row: any) {
    this.selectedId = row.idNumber;
    this.selectedCsn = row.csn;

    this.updateForm.patchValue({
      idNumber: row.idNumber,
      lostDamageType: '',
      reporteddate: '',
      description: ''
    });

    this.showUpdatePopup = true;
  }

  // CLOSE POPUP
  closePopup() {
    this.showUpdatePopup = false;
  }

  // SUBMIT UPDATE
  // submitUpdate() {
  //   const lostDamageType = this.updateForm.get('lostDamageType')?.value;
  //   const reportedDate = this.updateForm.get('reporteddate')?.value;

  //   // Validation
  //   if (!lostDamageType || !reportedDate) {
  //     Swal.fire({
  //       icon: 'warning',
  //       title: 'Missing Information',
  //       text: 'Please fill in all required fields',
  //       confirmButtonColor: '#1976d2'
  //     });
  //     return;
  //   }

  //   const payload = {
  //     iDnumber: this.selectedId,
  //     cardCsn: this.selectedCsn,
  //     lostDamageType: lostDamageType,
  //     reporteddate: reportedDate,
  //     description: this.updateForm.get('description')?.value || ''
  //   };
  // console.log('Payload to send:', payload);
  //   this.authService
  //     .addUpdateLostDamage(this.selectedId, payload)
  //     .subscribe({
  //       next: () => {
  //         // Close popup first
  //         this.showUpdatePopup = false;
          
  //         // Then show success alert (after popup is closed)
  //         setTimeout(() => {
  //           Swal.fire({
  //             icon: 'success',
  //             title: 'Updated Successfully',
  //             text: 'Card lost/damage information saved successfully',
  //             confirmButtonColor: '#1976d2'
  //           });
  //         }, 100);
  //       },
  //       error: (error) => {
  //         // Close popup first
  //         this.showUpdatePopup = false;
          
  //         // Then show error alert (after popup is closed)
  //         setTimeout(() => {
  //           Swal.fire({
  //             icon: 'error',
  //             title: 'Update Failed',
  //             text: error?.error?.message || 'Failed to update card information. Please try again.',
  //             confirmButtonColor: '#d32f2f'
  //           });
  //         }, 100);
  //       }
  //     });
  // }

  submitUpdate() {
  const lostDamageType = this.updateForm.get('lostDamageType')?.value;
  const reportedDate = this.updateForm.get('reporteddate')?.value;

  if (!lostDamageType || !reportedDate) {
    Swal.fire({
      icon: 'warning',
      title: 'Missing Information',
      text: 'Please fill in all required fields',
      confirmButtonColor: '#1976d2'
    });
    return;
  }

  const payload = {
    id: 0,
    iDnumber: this.selectedId,
    cardCsn: this.selectedCsn,
    description: this.updateForm.get('description')?.value || '',
    lostDamageType: lostDamageType === 'Lost' ? 'L' : 'D',
    reporteddate: new Date(reportedDate).toISOString(),
    blockeddate: new Date().toISOString(),
    createdOn: new Date().toISOString(),
    createdby: 0,
    updatedOn: new Date().toISOString(),
    updatedby: 0
  };

  console.log('Payload to send:', payload);

  this.authService
    .addUpdateLostDamage(this.selectedId, payload)
    .subscribe({
      next: () => {
        this.showUpdatePopup = false;
        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Updated Successfully',
            text: 'Card lost/damage information saved successfully',
            confirmButtonColor: '#1976d2'
          });
        }, 100);
      },
      error: (error) => {
        this.showUpdatePopup = false;
        setTimeout(() => {
          Swal.fire({
            icon: 'error',
            title: 'Update Failed',
            text: error?.error?.message || 'Failed to update card information.',
            confirmButtonColor: '#d32f2f'
          });
        }, 100);
      }
    });
}

}


