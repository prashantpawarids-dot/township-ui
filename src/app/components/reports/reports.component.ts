import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { FormsModule, ReactiveFormsModule  } from '@angular/forms';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reports',
  imports: [CommonModule, MaterialModule, RouterModule, FormsModule, ReactiveFormsModule, MatExpansionModule, MatFormFieldModule, MatSelectModule, MatDatepickerModule, MatInputModule, MatNativeDateModule, MatButtonModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class ReportsComponent {

  reportForm: FormGroup;

  cardTypes = [
    { value: 'Resident', label: 'Resident' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'Service provider', label: 'Service provider' },
    { value: 'Contractor Employee', label: 'Contractor Employee' },
    { value: 'Nanded Employee', label: 'Nanded Employee' },
    { value: 'Land Owner', label: 'Land Owner' },
    { value: 'Guest', label: 'Guest' }
    

  ];
tagAction: any;

  constructor(private fb: FormBuilder) {
    this.reportForm = this.fb.group({
      cardType: [''] 
    });
  }

  showReports() {
    console.log(this.reportForm.value);
  }

  exportReports() {
    console.log('Export Clicked');
  }

  search() {
    console.log('Search', this.reportForm.value.searchText);
  }

  showAll() {
    console.log('Show All Clicked');
  }
}
