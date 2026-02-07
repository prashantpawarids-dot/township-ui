import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
  selector: 'app-tag-block-revoke',
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
  templateUrl: './tag-block-revoke.component.html',
  styleUrl: './tag-block-revoke.component.scss'
})
export class TagBlockRevokeComponent implements OnInit {

  tagForm: FormGroup;
  updateForm: FormGroup;

  tableData: any[] = [];
  blockedCards: any[] = []; // Store blocked card data
  showUpdatePopup = false;

  selectedId!: number;
  selectedCsn!: string;
  selectedRow: any;

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
    this.tagForm = this.fb.group({
      cardType: [''],
      searchType: [''],
      searchData: ['']
    });

    this.updateForm = this.fb.group({
      idNumber: [{ value: '', disabled: true }],
      blockRevokeType: [''],
      fromdate: [''],
      todate: ['']
    });
  }

  ngOnInit() {
    this.loadBlockedCards();
  }

  // LOAD BLOCKED CARDS STATUS
  loadBlockedCards() {
    this.authService.getCardBlockRevokeStatus().subscribe({
      next: (res) => {
        this.blockedCards = res;
      },
      error: (error) => {
        console.error('Error loading blocked cards:', error);
      }
    });
  }

  // CHECK IF CARD IS BLOCKED
  isCardBlocked(row: any): boolean {
    const blockedCard = this.blockedCards.find(
      card => card.iDnumber == row.idNumber && card.revokeDate === null
    );
    return !!blockedCard;
  }

  // GET EXISTING BLOCK RECORD
  getBlockedRecord(idNumber: number): any {
    return this.blockedCards.find(
      card => card.iDnumber == idNumber && card.revokeDate === null
    );
  }

  // GET BUTTON TEXT
  getButtonText(row: any): string {
    return this.isCardBlocked(row) ? 'Revoke' : 'Block';
  }

  // GET BUTTON COLOR
  getButtonColor(row: any): string {
    return this.isCardBlocked(row) ? 'primary' : 'warn';
  }

  // SEARCH
  search() {
    const searchValue = this.tagForm.value.searchData;
    const searchType = this.tagForm.value.searchType;

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
    this.selectedRow = row;

    // Auto-select Block or Revoke based on current status
    const isBlocked = this.isCardBlocked(row);
    const autoSelectType = isBlocked ? 'R' : 'B';

    this.updateForm.patchValue({
      idNumber: row.idNumber,
      blockRevokeType: autoSelectType,
      fromdate: '',
      todate: ''
    });

    this.showUpdatePopup = true;
  }

  // CLOSE POPUP
  closePopup() {
    this.showUpdatePopup = false;
  }

  // SUBMIT UPDATE
  submitUpdate() {
    const blockRevokeType = this.updateForm.get('blockRevokeType')?.value;
    const fromDate = this.updateForm.get('fromdate')?.value;
    const toDate = this.updateForm.get('todate')?.value;

    if (!blockRevokeType) {
      Swal.fire({
        icon: 'warning',
        title: 'Missing Information',
        text: 'Please select Block or Revoke type',
        confirmButtonColor: '#1976d2'
      });
      return;
    }

    // Show confirmation based on action
    const confirmTitle = blockRevokeType === 'B' ? 'Block Card?' : 'Revoke Block?';
    const confirmText = blockRevokeType === 'B' 
      ? 'Are you sure you want to block this card?' 
      : 'Are you sure you want to revoke the block on this card?';

    Swal.fire({
      title: confirmTitle,
      text: confirmText,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#26263e',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, proceed',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processBlockRevoke(blockRevokeType, fromDate, toDate);
      }
    });
  }

  // PROCESS BLOCK/REVOKE
  processBlockRevoke(blockRevokeType: string, fromDate: any, toDate: any) {
    const payload = {
      id: 0,
      iDnumber: this.selectedId,
      cardCsn: this.selectedCsn,
      blockRevokType: blockRevokeType,
      fromdate: fromDate ? new Date(fromDate).toISOString() : new Date().toISOString(),
      todate: toDate ? new Date(toDate).toISOString() : new Date().toISOString(),
      createdOn: new Date().toISOString(),
      createdby: 0,
      updatedOn: new Date().toISOString(),
      updatedby: 0
    };

    console.log('Payload to send:', payload);

    this.authService.blockRevokeAccessCard(payload).subscribe({
      next: () => {
        this.showUpdatePopup = false;
        
        // Reload blocked cards status
        this.loadBlockedCards();

        setTimeout(() => {
          Swal.fire({
            icon: 'success',
            title: 'Success!',
            text: `Card ${blockRevokeType === 'B' ? 'blocked' : 'revoked'} successfully`,
            confirmButtonColor: '#1976d2'
          });
        }, 100);
      },
      error: (error) => {
        this.showUpdatePopup = false;
        setTimeout(() => {
          Swal.fire({
            icon: 'error',
            title: 'Failed',
            text: error?.error?.message || 'Operation failed. Please try again.',
            confirmButtonColor: '#d32f2f'
          });
        }, 100);
      }
    });
  }
}