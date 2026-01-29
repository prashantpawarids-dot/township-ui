import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { sortByTimeOnly } from 'src/app/_core/shared/utils/sort.util';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import { DateTimeUtil } from 'src/app/_core/shared/utils/datetime.util';
@Component({
  selector: 'app-resident',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './resident.component.html',
  styleUrls: ['../../../../table.css']
})
export class ResidentComponent implements OnInit, AfterViewInit {

  reportresidentForm: FormGroup;
  displayedData = new MatTableDataSource<any>([]);
  allData: any[] = [];
filteredData: any[] = [];

  uniqueProjects: string[] = [];
  filteredBuildings: string[] = [];
neighbourhoods: any[] = [];
allBuildings: any[] = [];
buildings: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchType = [
    { value: 'firstName', label: 'First Name' },
    { value: 'lastName', label: 'Last Name' },
    { value: 'shortName', label: 'Short Name' },
    { value: 'idNumber', label: 'ID Number' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient,private sortService: TableSortService) {
    let today=new Date();
    this.reportresidentForm = fb.group({
      searchType: [''],
      searchText: [''],
      project: [],
      building: [],
      fromDate: [today],
      toDate: [today]
    });
  }

  ngOnInit(): void {
  // On page load, show only headers
  this.displayedData.data = [];

  this.loadData();
this.loadNRDList();       // <-- NEW API CALL
  this.loadBuildingList();  // <-- NEW API CALL
  this.reportresidentForm.get('searchText')?.valueChanges
    .subscribe(() => this.autoSearch()); // only trigger on typing
}

loadData(): void {
  this.http.get<any[]>(`${environment.apiurl}Resident`).subscribe(res => {
    this.allData = res || [];

    

  
  });
}


 ngAfterViewInit(): void {
  this.displayedData.paginator = this.paginator;
}


  loadNRDList() {
  this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe(res => {
    this.neighbourhoods = res.map(n => ({
      value: n.name,
      label: n.name
    }));

    // Replace uniqueProjects list with new NRD list
    this.uniqueProjects = this.neighbourhoods.map(x => x.value);
  });
}

loadBuildingList() {
  this.http.get<any[]>(`${environment.apiurl}Building`).subscribe(res => {
    this.allBuildings = res.map(b => ({
      value: b.name,
      label: b.name,
      nrdName: b.nrdName,
      buildingName: b.name
    }));

    // Replace filteredBuildings with actual building API list
    this.filteredBuildings = this.allBuildings.map(b => b.buildingName);
  });
}


  // Called when NRD (Project) changes
onProjectChange() {
  const selected = this.reportresidentForm.value.project;

  if (selected.includes('All')) {
    // Select all projects
    this.reportresidentForm.patchValue({ project: [...this.uniqueProjects, 'All'] });
  }

  // Filter buildings based on selected projects
  if (selected.length === 0 || selected.includes('All')) {
    this.filteredBuildings = this.allBuildings.map(b => b.buildingName);
  } else {
    this.filteredBuildings = this.allBuildings
      .filter(b => selected.includes(b.nrdName))
      .map(b => b.buildingName);
  }

  // Reset building selection if current selection no longer exists
  const selectedBuildings = this.reportresidentForm.value.building || [];
  const newSelection = selectedBuildings.filter(b => this.filteredBuildings.includes(b));
  this.reportresidentForm.patchValue({ building: newSelection });
}

// Called when Building changes
onBuildingChange() {
  const selected = this.reportresidentForm.value.building;

  if (selected.includes('All')) {
    // Select all filtered buildings
    this.reportresidentForm.patchValue({ building: [...this.filteredBuildings, 'All'] });
  }
}

// Reset everything
showall(): void {
  this.reportresidentForm.reset({
    searchType: '',
    searchText: '',
    project: [],
    building: [],
    fromDate: '',
    toDate: ''
  });

  // Keep full lists after reset
  this.filteredBuildings = this.allBuildings.map(b => b.buildingName);

  // Clear table
  this.displayedData.data = [];

  if (this.paginator) this.paginator.firstPage();
}

  autoSearch(): void {
  const f = this.reportresidentForm.value;

  // If no search type or search text, clear displayed data
  if (!f.searchType || !f.searchText?.trim()) {
    this.displayedData.data = [];
    return;
  }

  const txt = f.searchText.trim().toLowerCase();

  // Filter the data to only include items where the field starts with the search text
  const data = this.allData.filter(item => 
    item[f.searchType]?.toString().toLowerCase().startsWith(txt)
  );

  // Update displayed data
  this.displayedData.data = data;

  // Reset pagination to first page
  if (this.paginator) {
    this.paginator.firstPage();
  }
}




public sortColumn(column: string) {
  // Check if the clicked column is the same as the last sorted column
  if (this.sortService.getSortColumn() === column) {
    // Same column clicked: toggle the sorting direction
    this.sortService.toggleDirection();
  } else {
    // New column clicked: default to ascending sort
    this.sortService.setSortColumn(column, 'asc');
  }

  // Apply sorting to the data (with a clone to prevent mutating the original data)
  this.displayedData.data = this.sortService.sortData([...this.displayedData.data], column);

  // Reset pagination to the first page after sorting
  if (this.paginator) {
    this.paginator.firstPage();
  }
}


// Methods for template
getSortColumn(): string {
  return this.sortService.getSortColumn();
}

getSortDirection(): 'asc' | 'desc' {
  return this.sortService.getSortDirection();
}




  // Full search function (project, building, dates + search)
  onSearch() {
    const f = this.reportresidentForm.value;
    let data = [...this.allData];

    if (f.project?.length) {
      data = data.filter(x => f.project.includes(x.nrdName));
    }

    if (f.building?.length) {
      data = data.filter(x => f.building.includes(x.buildingName));
    }

   if (f.fromDate) {
  const from = new Date(f.fromDate).setHours(0, 0, 0, 0); // Start of day
  data = data.filter(x => {
    const regDate = new Date(x.registrationIssueDate).getTime();
    return regDate >= from;
  });
}

if (f.toDate) {
  const to = new Date(f.toDate).setHours(23, 59, 59, 999); // End of day
  data = data.filter(x => {
    const regDate = new Date(x.registrationIssueDate).getTime();
    return regDate <= to;
  });
}


  // Search By + Search Text
if (f.searchText && f.searchText.trim() !== '') {

  if (!f.searchType) {
    alert('Please select a search type');
    this.displayedData.data = [];
    return;
  }

  const txt = f.searchText.trim().toLowerCase();
  data = data.filter(item =>
    item[f.searchType]?.toString().toLowerCase().startsWith(txt)
  );
}






    this.displayedData.data = data;
    this.filteredData = data; // ✅ Save all filtered data
    if (this.paginator) this.paginator.firstPage();
  }

  stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  



  exportPDF() {
  if (!this.filteredData.length) return;

  const doc = new jsPDF('p', 'mm', 'a4'); // Portrait
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg'; // Logo path
  const generated = new Date().toLocaleString();

  // Helper: Get min/max registrationIssueDate from displayed data
  const getMinMaxDates = (data: any[]): { min: Date | null; max: Date | null } => {
    const dates = data
      .map(x => x.registrationIssueDate ? new Date(x.registrationIssueDate) : null)
      .filter(d => d instanceof Date && !isNaN(d.getTime()));
    if (!dates.length) return { min: null, max: null };
    return {
      min: new Date(Math.min(...dates.map(d => d!.getTime()))),
      max: new Date(Math.max(...dates.map(d => d!.getTime())))
    };
  };

  const { min, max } = getMinMaxDates(this.filteredData);

  logo.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Top-left logo
    doc.addImage(logo, 'JPEG', 10, 10, 15, 15);

    // Top-right print date
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Printed On: ${generated}`, pageWidth - 10, 20, { align: 'right' });

    // Heading
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('RESIDENT REPORT', pageWidth / 2, 20, { align: 'center' });

    // Date Range below heading
    if (min && max) {
      const fromStr = min.toLocaleDateString();
      const toStr = max.toLocaleDateString();
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`From: ${fromStr} to ${toStr}`, pageWidth / 2, 32, { align: 'center' });
    }

    // Table body
    const body = this.filteredData.map((r, i) => [
      i + 1,
      r.shortName || 'N/A',
      r.flatNumber || 'N/A',
      r.buildingName || 'N/A',
      r.mobileNo || 'N/A',
      r.emailID || 'N/A',
      r.registrationIssueDate ? new Date(r.registrationIssueDate).toLocaleDateString() : 'N/A'
    ]);

    autoTable(doc, {
      startY: min && max ? 40 : 45,
      head: [['Sr No', 'Name', 'Flat', 'Building', 'Mobile', 'Email', 'Reg Date']],
      body,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
       bodyStyles: {
    fontSize: 9,                 // ⬅ increase
    textColor: [0, 0, 0],         // ⬅ force black
    fontStyle: 'normal'
  },

      didDrawPage: (data) => {
        // Footer left: copyright
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text('©IDS ID Smart Tech', 10, pageHeight - 10);

        // Footer right: page number
        const pageCount = (doc as any).internal.pages.length - 1;
        const currentPage = data.pageNumber;
        doc.text(`Page ${currentPage} of ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
      }
    });

    doc.save('ResidentReport.pdf');
  };

  logo.onerror = () => console.error('Logo failed to load.');
}


exportExcel() {
  if (!this.filteredData.length) return;

  const generated = new Date().toLocaleString();

  // Get min/max registrationIssueDate
  const dates = this.filteredData
    .map(x => x.registrationIssueDate ? new Date(x.registrationIssueDate) : null)
    .filter(d => d instanceof Date && !isNaN(d.getTime()));
  const min = dates.length ? new Date(Math.min(...dates.map(d => d!.getTime()))) : null;
  const max = dates.length ? new Date(Math.max(...dates.map(d => d!.getTime()))) : null;
  const fromStr = min ? min.toLocaleDateString() : '';
  const toStr = max ? max.toLocaleDateString() : '';

  const excelData = this.filteredData.map((r, i) => ({
    'Sr No': i + 1,
    'ID No': r.idNumber || '',
    'ICE No': r.icEno || '',
    'First Name': r.firstName || '',
    'Middle Name': r.middleName || '',
    'Last Name': r.lastName || '',
    'Short Name': r.shortName || '',
    'Gender': r.gender || '',
    'Blood Group': r.bloodGroup || '',
    'DOB': r.dob ? new Date(r.dob).toLocaleDateString('en-GB') : '',
    'Email': r.emailID || '',
    'Mobile': r.mobileNo || '',
    'Landline': r.landLine || '',
    'Aadhar ID': r.aadharCardId || '',
    'Voter ID': r.voterID || '',
    'Flat No': r.flatNumber || '',
    'Tag No': r.tagNumber || '',
    'PAN No': r.paNnumber || '',
    'Passport No': r.passportNo || '',
    'License No': r.licenseNo || '',
    'Card Issue Date': r.cardIssueDate ? DateTimeUtil.formatDateTime(r.cardIssueDate) : '',
'Card Print Date': r.cardPrintingDate ? DateTimeUtil.formatDateTime(r.cardPrintingDate) : '',
'Reg Issue Date': r.registrationIssueDate ? DateTimeUtil.formatDateTime(r.registrationIssueDate) : '',

    'Project NRD': r.nrdName || '',
    'Building': r.buildingName || ''
  }));

  const header = [
    ['RESIDENT REPORT'],
    (fromStr && toStr) ? [`From: ${fromStr} to ${toStr}`] : [],
    [] // empty row before table
  ];

  const ws = XLSX.utils.aoa_to_sheet(header);
  XLSX.utils.sheet_add_json(ws, excelData, { origin: `A${header.length + 1}` });

  // Merge header across columns
  const totalCols = Object.keys(excelData[0]).length;
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }];
  ws['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: 'center' } };

  // Auto width
  ws['!cols'] = new Array(totalCols).fill({ wch: 20 });

  // Generated date at bottom
  const lastRow = excelData.length + header.length + 2;
  ws[`A${lastRow}`] = { t: 's', v: `printed On: ${generated}` };
  ws['!merges'].push({ s: { r: lastRow - 1, c: 0 }, e: { r: lastRow - 1, c: totalCols - 1 } });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'ResidentReport');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf]), 'ResidentReport.xlsx');
}
}
