import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
@Component({
  selector: 'app-datewise-search-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule, 
    MatPaginatorModule
  ],
  templateUrl: './datewise-search-report.component.html',
  styleUrl: './datewise-search-report.component.scss'
})
export class DatewiseSearchReportComponent implements AfterViewInit{

  reportForm: FormGroup;
  
  // Define cardTypes array
  cardTypes = [
    { value: 'Resident', label: 'Resident' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'Service provider', label: 'Service provider' },
    { value: 'Contractor Employee', label: 'Contractor Employee' },
    { value: 'Nanded Employee', label: 'Nanded Employee' },
    { value: 'Land Owner', label: 'Land Owner' },
    { value: 'Guest', label: 'Guest' }
  ];

  constructor(private fb: FormBuilder) {}
    ngOnInit(): void {
      this.reportForm = this.fb.group({
        cardType: [''],
        fromDate: [''],
        toDate: ['']
      });
    }
  
 @ViewChild(MatPaginator) paginator: MatPaginator;

  displayedColumns: string[] = ['srNo', 'name', 'cardIssue', 'registrationDate','neighbourhood','building','flat'
    ,'mobileNo','email'];
  dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
name: string;
  srNo: number;
  cardIssue: number;
  registrationDate: number;
  neighbourhood: string;
  building: string;
  flat: string;
  mobileNo: number;
  email: string;
  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ////////////////////////////////////
 showCSV(){
    const csvData = this.convertToCSV([
      // { name: 'John Doe', age: 30, email: 'john@example.com' },
      // { name: 'Jane Smith', age: 25, email: 'jane@example.com' }
    ]);

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'data.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  convertToCSV(objArray: any[]): string {
    const header = Object.keys(objArray[0]).join(',') + '\r\n';
    const rows = objArray.map(obj =>
      Object.values(obj).join(',')
    ).join('\r\n');
    return header + rows;
  }

 
  

  // Define the showReports method
  showReports() {
    console.log('Show Reports Clicked', this.reportForm.value);
    // Implement your logic here
  }

  // Define the exportReports method
  exportReports() {
    console.log('Export Reports Clicked', this.reportForm.value);
    // Implement export logic here
  }

}

export interface PeriodicElement {
  name: string;
  srNo: number;
  cardIssue: number;
  registrationDate: number;
  neighbourhood: string;
  building: string;
  flat: string;
  mobileNo: number;
  email: string;
}

const ELEMENT_DATA: PeriodicElement[] = [
  {srNo: 1, name: 'Hydrogen', cardIssue: 1.0079,  registrationDate:12, neighbourhood: 'H',building:'a',flat:'ab',mobileNo:12,email:'ab'},
  {srNo: 2, name: 'Helium', cardIssue: 4.0026, registrationDate:12,neighbourhood: 'He', building:'b',flat:'ab',mobileNo:12,email:'ab'},
  {srNo: 3, name: 'Lithium', cardIssue: 6.941, registrationDate:12,neighbourhood: 'Li',building:'c',flat:'ab',mobileNo:12,email:'ab'},
  {srNo: 4, name: 'Beryllium', cardIssue: 9.0122,registrationDate:12, neighbourhood: 'Be',building:'d',flat:'ab',mobileNo:12,email:'ab'}
];
