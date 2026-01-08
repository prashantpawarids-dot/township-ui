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
import { MatNativeDateModule } from '@angular/material/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
@Component({
  selector: 'app-land-owner',
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
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './land-owner.component.html',
  styleUrls: ['../../../../table.css']
})
export class LandOwnerComponent implements OnInit, AfterViewInit {
  landOwnerForm!: FormGroup;
  dataSource = new MatTableDataSource<any>([]);
  allData: any[] = [];
neighbourhoods: any[] = [];
uniqueProjects: string[] = [];
allBuildings: any[] = [];
filteredBuildings: string[] = [];
filteredData: any[] = [];

  searchByOptions = [
  { value: 'firstName', label: 'First Name' },
  { value: 'lastName', label: 'Last Name' },
  { value: 'shortName', label: 'Short Name' },
  { value: 'emailID', label: 'Email' },
  { value: 'mobileNo', label: 'Mobile Number' },
  { value: 'flatNumber', label: 'Flat Number' },
  { value: 'paNnumber', label: 'PAN Number' }
];


  neighbourhoodList: string[] = [];
  buildingList: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, private http: HttpClient ,private sortService: TableSortService) {}

  ngOnInit(): void {
    let today=new Date();
  this.landOwnerForm = this.fb.group({
    searchBy: [''],
    searchText: [''],
    neighbourhood: [[]],
    building: [[]],
    fromDate: [today],
    toDate: [today]
  });

  // Load dropdowns from separate APIs
  this.loadNRDList();
  this.loadBuildingList();
  this.loadData();

  // Auto-filter as user types
  this.landOwnerForm.get('searchText')?.valueChanges
    .pipe(debounceTime(200), distinctUntilChanged())
    .subscribe(() => this.applySearchByFilter());

  this.landOwnerForm.get('searchBy')?.valueChanges
    .subscribe(() => this.applySearchByFilter());

  // Initially table headers only
  this.dataSource.data = [];
}



  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  /** Load unique neighbourhoods and buildings from API */
  loadDropdowns() {
    this.http.get<any[]>(`${environment.apiurl}Landowner`).subscribe({
      next: (res) => {
        if (!res || !res.length) return;

        this.neighbourhoodList = Array.from(new Set(res.map(r => r.nrdName).filter(Boolean)));
        this.buildingList = Array.from(new Set(res.map(r => r.buildingName).filter(Boolean)));
      },
      error: (err) => console.error('Error loading dropdowns', err)
    });
  }
loadNRDList() {
  this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe(res => {
    this.neighbourhoods = res.map(n => ({ value: n.name, label: n.name }));
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
    this.filteredBuildings = this.allBuildings.map(b => b.buildingName);
  });
}

  loadData() {
  this.http.get<any[]>(`${environment.apiurl}Landowner`).subscribe({
    next: (res) => {
      this.allData = res || [];
      // Do NOT show data initially; keep table empty
      // this.dataSource.data = [...this.allData]; // Removed
    },
    error: (err) => console.error(err)
  });
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
  this.dataSource.data = this.sortService.sortData([...this.dataSource.data], column);

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

  private applySearchByFilter() {
  const { searchBy, searchText } = this.landOwnerForm.value;
  let filtered = [...this.dataSource.data]; // filter current table data (or allData if needed)

  if (searchText) {
    const text = searchText.toLowerCase();
    filtered = filtered.filter(x => x[searchBy]?.toString().toLowerCase().startsWith(text));
  }

  this.dataSource.data = filtered;
  this.paginator.firstPage();
}


 // Neighbourhood change
onNeighbourhoodChange(event: any) {
  const selected = event.value;
  if (selected.includes('ALL')) {
    // Select all neighbourhoods (without adding 'ALL' to the form value)
    this.landOwnerForm.get('neighbourhood')?.setValue([...this.uniqueProjects]);
  }

  // Filter buildings based on selected neighbourhoods
  const selectedNeighbourhoods = this.landOwnerForm.value.neighbourhood || [];
  if (selectedNeighbourhoods.length === 0) {
    this.filteredBuildings = this.allBuildings.map(b => b.buildingName);
  } else {
    this.filteredBuildings = this.allBuildings
      .filter(b => selectedNeighbourhoods.includes(b.nrdName))
      .map(b => b.buildingName);
  }

  // Reset building selection if no longer valid
  const selectedBuildings = this.landOwnerForm.value.building || [];
  const newSelection = selectedBuildings.filter(b => this.filteredBuildings.includes(b));
  this.landOwnerForm.patchValue({ building: newSelection });
}

// Building change
onBuildingChange(event: any) {
  const selected = event.value;
  if (selected.includes('ALL')) {
    // Select all filtered buildings
    this.landOwnerForm.get('building')?.setValue([...this.filteredBuildings]);
  }
}



 applyFilters() {
  let filtered = [...this.allData];
  const { neighbourhood, building, fromDate, toDate, searchBy, searchText } = this.landOwnerForm.value;

  if (neighbourhood?.length) filtered = filtered.filter(x => neighbourhood.includes(x.nrdName));
  if (building?.length) filtered = filtered.filter(x => building.includes(x.buildingName));
  if (fromDate) {
  const from = new Date(fromDate);
  from.setHours(0, 0, 0, 0); // start of day
  filtered = filtered.filter(x => x.cardIssueDate && new Date(x.cardIssueDate) >= from);
}

if (toDate) {
  const to = new Date(toDate);
  to.setHours(23, 59, 59, 999); // end of day
  filtered = filtered.filter(x => x.cardIssueDate && new Date(x.cardIssueDate) <= to);
}

  if (searchText && searchText.trim() !== '') {
    if (!searchBy) {
      alert('Please select a search type');
      this.dataSource.data = [];
      this.filteredData = [];
      return;
    }
    const text = searchText.trim().toLowerCase();
    filtered = filtered.filter(x => x[searchBy]?.toString().toLowerCase().startsWith(text));
  }

  this.filteredData = filtered; // ✅ Save full filtered data
  this.dataSource.data = filtered;
  this.paginator.firstPage();
}



//Used For clear field
  showAll() {
  this.landOwnerForm.reset({
    searchBy: '',
    searchText: '',
    neighbourhood: [],
    building: [],
    fromDate: '',
    toDate: ''
  });

  // Show all data
  this.dataSource.data = [];
  this.paginator.firstPage();
}

get paginatedData() {
  if (!this.paginator) return this.dataSource.data;
  const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
  const endIndex = startIndex + this.paginator.pageSize;
  return this.dataSource.data.slice(startIndex, endIndex);
}

  exportPDF() {
  if (!this.filteredData.length) return;

  const doc = new jsPDF('l', 'mm', 'a4');
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';
  const generated = new Date().toLocaleString();

  // Only use paginated data
  const pageData = this.filteredData;

  const dates = pageData
    .map(r => r.cardIssueDate ? new Date(r.cardIssueDate) : null)
    .filter(d => d != null) as Date[];
  const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
  const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

  logo.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.addImage(logo, 'JPEG', 10, 10, 15, 15);

    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('Land Owner Report', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`printed on: ${generated}`, pageWidth - 10, 20, { align: 'right' });

    let minMaxText = '';
    if (minDate && maxDate) {
      minMaxText = `From: ${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`;
    }
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text(minMaxText, pageWidth / 2, 30, { align: 'center' });

    const body = pageData.map((r, i) => [
      i + 1,
      r.idNumber || '',
      r.shortName || '',
      r.nrdName || '',
      r.buildingName || '',
      r.cardIssueDate ? new Date(r.cardIssueDate).toLocaleDateString() : ''
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['SrNo', 'ID', 'Short Name', 'Neighbourhood', 'Building', 'Card Issue Date']],
      body,
      theme: 'grid',
      headStyles: { fillColor: [220,220,220], textColor: 0, fontStyle: 'bold', halign: 'center', fontSize: 10 },
       bodyStyles: {
    fontSize: 9,                 // ⬅ increase
    textColor: [0, 0, 0],         // ⬅ force black
    fontStyle: 'normal'
  },

      didDrawPage: (data) => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const pageCount = doc.internal.pages.length - 1;
        doc.setFontSize(10);
        doc.text(`Page ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
        doc.text('©IDS ID SMART TECH', 10, pageHeight - 10);
      }
    });

    doc.save('LandOwnerReport.pdf');
  };
}


 exportExcel() {
  if (!this.filteredData.length) return;

  const printedDate = new Date().toLocaleString();

  // Use paginated data
  const excelData = this.filteredData.map((r, i) => ({
    'Sr No': i + 1,
    'ID': r.idNumber || '',
    'First Name': r.firstName || '',
    'Middle Name': r.middleName || '',
    'Last Name': r.lastName || '',
    'Short Name': r.shortName || '',
    'Gender': r.gender || '',
    'Blood Group': r.bloodGroup || '',
    'DOB': r.dob ? new Date(r.dob).toLocaleDateString() : '',
    'Email': r.emailID || '',
    'Mobile': r.mobileNo || '',
    'LandLine': r.landLine || '',
    'Flat Number': r.flatNumber || '',
    'Card Issue Date': r.cardIssueDate ? new Date(r.cardIssueDate).toLocaleDateString() : '',
    'Neighbourhood': r.nrdName || '',
    'Building': r.buildingName || '',
    'PAN': r.paNnumber || '',
    'Passport': r.passportNo || '',
    'License': r.licenseNo || '',
    'ICE No': r.icEno || '',
    'Aadhar': r.aadharCardId || '',
    'VoterID': r.voterID || '',
    'Status': r.logicalDeleted === 0 ? 'Deleted' : 'Active'
  }));

  const wb = XLSX.utils.book_new();

  const wsData: any[][] = [
    ["LAND OWNER REPORT", "", "", "", "", "", "", "", "", "", "", "", `Printed: ${printedDate}`],
    [],
    Object.keys(excelData[0])
  ];

  excelData.forEach(row => wsData.push(Object.values(row)));

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Row 1 styling
  ws["A1"].s = { font: { bold: true, sz: 20 }, alignment: { horizontal: "center" } };
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 11 } });

  // Printed date styling
  const printedCell = XLSX.utils.encode_cell({ r: 0, c: 12 });
  ws[printedCell].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: "right" } };

  // Header row styling
  const headers = Object.keys(excelData[0]);
  headers.forEach((h, idx) => {
    const headerCell = XLSX.utils.encode_cell({ r: 2, c: idx });
    ws[headerCell].s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: "center" },
      fill: { fgColor: { rgb: "DDEBF7" } },
      border: {
        top: { style: "thin", color: { rgb: "000" } },
        bottom: { style: "thin", color: { rgb: "000" } },
        left: { style: "thin", color: { rgb: "000" } },
        right: { style: "thin", color: { rgb: "000" } }
      }
    };
  });

  ws["!cols"] = headers.map(h => ({ wch: h.length + 15 }));

  XLSX.utils.book_append_sheet(wb, ws, 'LandOwnerReport');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer]), 'LandOwnerReport.xlsx');
}


}
