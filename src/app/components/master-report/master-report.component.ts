import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-master-report',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule
  ],
  templateUrl: './master-report.component.html',
  styleUrls: ['./master-report.component.scss']
})
export class MasterReportComponent {
  reportForm: FormGroup;

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
