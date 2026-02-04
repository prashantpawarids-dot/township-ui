import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-service-provider',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule
  ],
  templateUrl: './service-provider.component.html',
  styleUrls: ['../../../../table.css']
})
export class ServiceProviderComponent implements OnInit, AfterViewInit {

  serviceForm!: FormGroup;
  searchType = [
    { value: 'shortName', label: 'Short Name' },
    { value: 'serviceType', label: 'Service Type' },
    { value: 'mobileNo', label: 'Mobile' },
    { value: 'idNumber', label: 'ID Number' }
  ];

  dataSource = new MatTableDataSource<any>([]);
  allData: any[] = [];
  isSearchClicked = false;
filteredData: any[] = []; // Add this property
 neighbourhoods: { value: string, label: string }[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    
  }

  ngOnInit(): void {
    let today=new Date();
    this.serviceForm = this.fb.group({
      searchType: [''],
      searchText: [''],
      fromDate: [today],
      toDate: [today],
       neighbourhood: [[]] // ✅ Add this line for multi-select NRD
      
    });
  this.loadNeighbourhoods(); // load NRD list
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  // Load all data but don't show initially
  loadData() {
    this.http.get<any[]>(`${environment.apiurl}Service_Provider/GetAllServiceProviders`).subscribe({
      next: (res) => {
        this.allData = res;
        this.dataSource.data = []; // DO NOT show data on load
      },
      error: (err) => console.error(err)
    });
  }

loadNeighbourhoods() {
  // Example API call: replace with your real API if needed
  this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe({
    next: (res) => {
      this.neighbourhoods = res.map(n => ({ value: n.name, label: n.name }));
    },
    error: (err) => console.error(err)
  });
}


// Called when user selects/de-selects NRDs
onNeighbourhoodChange(event: any) {
  const selected = event.value;

  if (selected.includes('ALL')) {
    // Only show ALL if selected
    this.serviceForm.get('neighbourhood')?.setValue(['ALL'], { emitEvent: false });
    return;
  }

  // Remove 'ALL' if other options are selected
  this.serviceForm.get('neighbourhood')?.setValue(selected.filter(v => v !== 'ALL'), { emitEvent: false });

  // Reorder the neighbourhoods so selected ones appear first
  this.reorderNeighbourhoods();
}

// Helper: reorder NRD list
reorderNeighbourhoods() {
  const selected = this.serviceForm.get('neighbourhood')?.value || [];
  if (!selected.length) return;

  const selectedSet = new Set(selected);
  const selectedNRDs = this.neighbourhoods.filter(n => selectedSet.has(n.value));
  const otherNRDs = this.neighbourhoods.filter(n => !selectedSet.has(n.value));

  this.neighbourhoods = [...selectedNRDs, ...otherNRDs];
}


filterData() {
  this.isSearchClicked = true;
  const { searchType, searchText, fromDate, toDate } = this.serviceForm.value;

  let filtered = [...this.allData];

  // --- Search Text & Type ---
  if (searchText && searchText.trim() !== '') {
    if (!searchType) {
      alert('Please select a search type');
      this.dataSource.data = [];
      this.filteredData = [];
      return;
    }

    filtered = filtered.filter(x =>
      x[searchType]?.toString().toLowerCase().startsWith(searchText.trim().toLowerCase())
    );
  }

//   const from = fromDate ? new Date(fromDate) : null;
// const to = toDate ? new Date(toDate) : null;

// if (from) from.setHours(0, 0, 0, 0);       // start of day
// if (to) to.setHours(23, 59, 59, 999);     // end of day

// filtered = filtered.filter(item => {
//   const validFrom = item.validFromDate ? new Date(item.validFromDate) : null;
//   const validTo = item.validToDate ? new Date(item.validToDate) : null;

//   if (!validFrom || !validTo) return false;

//   // Fully inside selected range
//   return (!from || validFrom >= from) && (!to || validTo <= to);
// });
// --- Neighbourhood filter ---
const { neighbourhood } = this.serviceForm.value;
if (neighbourhood && neighbourhood.length) {
  if (!neighbourhood.includes('ALL')) {
    filtered = filtered.filter(item => neighbourhood.includes(item.nrdName));
  }
}


const from = fromDate ? new Date(fromDate) : null;
const to = toDate ? new Date(toDate) : null;

if (from) from.setHours(0, 0, 0, 0);
if (to) to.setHours(23, 59, 59, 999);

filtered = filtered.filter(item => {
  if (!item.createdOn) return false;

  const createdOn = new Date(item.createdOn);
  return (!from || createdOn >= from) && (!to || createdOn <= to);
});



  // ✅ Always set filteredData
  this.filteredData = filtered;

  this.dataSource.data = filtered;
  this.dataSource.paginator = this.paginator;
}




  // Clear form fields, do NOT show data
  clear() {
    this.serviceForm.reset({
      searchType: '',
      searchText: '',
      fromDate: '',
      toDate: ''
    });

    this.isSearchClicked = false;
    this.dataSource.data = []; // DO NOT show data
  }

 exportPDF() {
  if (!this.filteredData.length) return;

  const generated = new Date().toLocaleString();
  const doc = new jsPDF('l', 'mm', 'a4');
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  logo.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Logo top-left
    doc.addImage(logo, 'JPEG', 10, 10, 20, 20);

    // Title centered
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('SERVICE PROVIDER REPORT', pageWidth / 2, 20, { align: 'center' });

    const createdDates = this.filteredData
  .map(r => r.createdOn ? new Date(r.createdOn).getTime() : null)
  .filter(d => d);

if (createdDates.length) {
  const minDate = new Date(Math.min(...createdDates)).toLocaleDateString();
  const maxDate = new Date(Math.max(...createdDates)).toLocaleDateString();

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`From: ${minDate} To: ${maxDate}`, pageWidth / 2, 28, { align: 'center' });
}


    // Printed On top-right
    doc.setFontSize(10);
    doc.text(`Printed On: ${generated}`, pageWidth - 10, 20, { align: 'right' });

    // Table body
   const body = this.filteredData.map((r, i) => [
  i + 1,
  r.shortName || 'N/A',
  r.serviceType || 'N/A',
  r.doj ? new Date(r.doj).toLocaleDateString() : 'N/A',
  r.flatNumber || 'N/A',
  r.validFromDate ? new Date(r.validFromDate).toLocaleDateString() : 'N/A',
  r.validToDate ? new Date(r.validToDate).toLocaleDateString() : 'N/A',
  r.createdOn ? new Date(r.createdOn).toLocaleDateString() : 'N/A',
]);
    autoTable(doc, {
      startY: 35,
      head: [['Sr No', 'Short Name', 'Service Type', 'Joining Date', 'Flat Number', 'Valid From', 'Valid To', 'Created']],
      body,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9, textColor: [0, 0, 0], fontStyle: 'normal' },
      styles: { font: 'helvetica', overflow: 'linebreak', cellPadding: 2 },
      didDrawPage: (data) => {
        // Footer
        doc.setFontSize(10);
        doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('©IDS ID SMART TECH', 10, pageHeight - 10);
      }
    });

    doc.save('ServiceProviderReport.pdf');
  };
}


  // Export Excel
  exportExcel() {
    if (!this.filteredData.length) return;

    const excelData = this.filteredData.map((r, i) => ({
      'SrNo': i + 1,
      'ID Number': r.idNumber,
      'First Name': r.firstName,
      'Middle Name': r.middleName,
      'Last Name': r.lastName,
      'Mobile': r.mobileNo,
      'Gender': r.gender,
      'Blood Group': r.bloodGroup,
      'Email': r.emailID,
      'Aadhar Card': r.aadharCardId,
      'Voter ID': r.voterID,
      'Address': r.address,
      'Service Type': r.serviceType,
      'Reference 1 Name': r.refrence1Name,
      'Reference 1 Mobile': r.refrence1Mobile,
      'Reference 2 Name': r.refrence2Name,
      'Reference 2 Mobile': r.refrence2Mobile,
      'Joining Date': r.doj ? new Date(r.doj).toLocaleDateString() : '',
      'Valid From': r.validFromDate ? new Date(r.validFromDate).toLocaleDateString() : '',
      'Valid To': r.validToDate ? new Date(r.validToDate).toLocaleDateString() : '',
      
      'Neighbourhood': r.nrd,
      'Building': r.building,
      'FlatNumber': r.flatNumber,
      'Created On': r.createdOn ? new Date(r.createdOn).toLocaleDateString() : '',
      
      
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Service Providers');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'ServiceProviderReport.xlsx');
  }

}
