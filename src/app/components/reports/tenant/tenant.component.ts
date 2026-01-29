import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';
import { DateTimeUtil } from 'src/app/_core/shared/utils/datetime.util';
@Component({
  selector: 'app-tenant',
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
  templateUrl: './tenant.component.html',
  styleUrls: ['../../../../table.css']
})
export class TenantComponent implements OnInit {

  reportForm!: FormGroup;

  displayedData = new MatTableDataSource<any>([]);
  allData: any[] = [];
  filteredData: any[] = [];

  projectList: string[] = [];
  buildingList: string[] = [];
isAllProjectSelected = false;
isAllBuildingSelected = false;
neighbourhoods: { value: string, label: string }[] = [];
allBuildings: any[] = [];
buildings: any[] = [];


  // PAGINATION
  pageSize = 10;
  currentPage = 0;
  totalItems = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchType = [
    { value: 'shortName', label: 'Short Name' },
    { value: 'flatNumber', label: 'Flat No' },
    // { value: 'buildingName', label: 'Building' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient ,private sortService: TableSortService) {}

  ngOnInit() {
let today=new Date();
    this.reportForm = this.fb.group({
      project: [''],
      building: [''],
      fromDate: [today],
      toDate: [today],
      searchType: [''],
      searchText: ['']
    });

   this.loadData();
this.loadNRDList();
this.loadBuildingList();

  }

  // Load API data
  loadData() {
    const apiUrl = `${environment.apiurl}Tenent`;

    this.http.get<any[]>(apiUrl).subscribe({
      next: data => {
        this.allData = data;

       

        this.filteredData = [];
        this.displayedData.data = [];
      },
      error: err => console.error(err)
    });
  }


  loadNRDList() {
  this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe(res => {
    this.neighbourhoods = res.map(n => ({ value: n.name, label: n.name }));
    this.projectList = this.neighbourhoods.map(n => n.value);
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
    this.buildingList = this.allBuildings.map(b => b.value);
    this.buildings = [...this.allBuildings];
  });
}
filterBuildingsByNRD(selectedNRDs: string[]) {
  if (!selectedNRDs || selectedNRDs.length === 0 || selectedNRDs.includes('ALL')) {
    // Show all buildings if no NRD selected or ALL selected
    this.buildingList = this.allBuildings.map(b => b.value);
    return;
  }

  this.buildingList = this.allBuildings
    .filter(b => selectedNRDs.includes(b.nrdName))
    .map(b => b.value);

  // If the previously selected building is no longer valid, reset it
  const selectedBuildings = this.reportForm.value.building || [];
  const validBuildings = selectedBuildings.filter((b: string) => this.buildingList.includes(b));
  this.reportForm.get('building')?.setValue(validBuildings);
}


toggleSelectAllProject() {
  const all = this.projectList;
  const ctrl = this.reportForm.get('project');

  if (!this.isAllProjectSelected) {
    ctrl?.setValue(['ALL', ...all]);
  } else {
    ctrl?.setValue([]);
  }

  this.isAllProjectSelected = !this.isAllProjectSelected;

  // Filter buildings based on current selection
  this.filterBuildingsByNRD(ctrl?.value);
}


onProjectSelect(event: any) {
  const selection = event.value;

  // Remove ALL when user manually deselects
  if (selection.indexOf('ALL') > -1) return;

  this.isAllProjectSelected = selection.length === this.projectList.length;

  if (this.isAllProjectSelected) {
    this.reportForm.get('project')?.setValue(['ALL', ...this.projectList]);
  }

  // Filter buildings based on selected NRDs
  this.filterBuildingsByNRD(selection);
}

toggleSelectAllBuilding() {
  const all = this.buildingList;
  const ctrl = this.reportForm.get('building');

  if (!this.isAllBuildingSelected) {
    ctrl?.setValue(['ALL', ...all]);
  } else {
    ctrl?.setValue([]);
  }

  this.isAllBuildingSelected = !this.isAllBuildingSelected;
}

onBuildingSelect(event: any) {
  const selection = event.value;

  if (selection.indexOf('ALL') > -1) return;

  this.isAllBuildingSelected = selection.length === this.buildingList.length;

  if (this.isAllBuildingSelected) {
    this.reportForm.get('building')?.setValue(['ALL', ...this.buildingList]);
  }
}

  // Auto filter for search text
  autoSearchFilter() {
  const searchType = this.reportForm.value.searchType;
  const text = this.reportForm.value.searchText?.toLowerCase() || '';

  if (!text) return;

  let filtered = [...this.allData];

  // Use startsWith instead of includes
  filtered = filtered.filter(d =>
    d[searchType]?.toString().toLowerCase().startsWith(text)
  );

  this.filteredData = filtered;
  this.currentPage = 0;
  this.applyPagination(this.filteredData);
}


  search() {
  const { project, building, fromDate, toDate, searchType, searchText } = this.reportForm.value;

  let filtered = [...this.allData];

  // --- Project filter ---
  if (project && project.length && !project.includes('ALL')) {
    filtered = filtered.filter(x => project.includes(x.nrdName));
  }

  // --- Building filter ---
  if (building && building.length && !building.includes('ALL')) {
    filtered = filtered.filter(x => building.includes(x.buildingName));
  }

  // --- Date filter ---
if (fromDate) {
  const f = new Date(fromDate).setHours(0, 0, 0, 0); // start of day
  filtered = filtered.filter(x =>
    new Date(x.registrationIssueDate).getTime() >= f
  );
}

if (toDate) {
  const t = new Date(toDate).setHours(23, 59, 59, 999); // end of day
  filtered = filtered.filter(x =>
    new Date(x.registrationIssueDate).getTime() <= t
  );
}

// --- Search By + Search Text ---
if (searchText && searchText.trim() !== '') {

  if (!searchType) {
    alert('Please select a search type');
    this.filteredData = [];
    this.displayedData.data = [];
    return;
  }

  const txt = searchText.trim().toLowerCase();
  const txtLen = txt.length;

  filtered = filtered.filter(item => {
    const field = item[searchType];
    if (!field) return false;

    const fieldStr = field.toString().toLowerCase();
    return field.toString().toLowerCase().startsWith(txt);
  });
}


  this.filteredData = filtered;
  this.currentPage = 0;
  this.applyPagination(this.filteredData);
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

  // Pagination logic
  applyPagination(data: any[]) {
    this.totalItems = data.length;

    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;

    this.displayedData.data = data.slice(start, end);
  }

  // On paginator click
  onPageChange(event: any) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;

    this.applyPagination(this.filteredData);
  }

  // Reset
  showAll() {
    this.reportForm.reset({
      project: '',
      building: '',
      fromDate: '',
      toDate: '',
      searchType: '',
      searchText: ''
    });

    
  }

  exportPDF() {
  if (!this.filteredData || this.filteredData.length === 0) return;

  const doc = new jsPDF();
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  logo.onload = () => {
    // --- Logo ---
    doc.addImage(logo, 'JPEG', 10, 10, 15,15);

    // --- Title ---
    doc.setFontSize(18);
    doc.text('Tenant Report', pageWidth / 2, 20, { align: 'center' });

    // --------------------------------------------------
    //     NEW DATE RANGE BASED ON registrationIssueDate
    // --------------------------------------------------
    const filteredDates = this.filteredData
  .map(x => new Date(x.registrationIssueDate))
  .filter(d => !isNaN(d.getTime()))
  .sort((a, b) => a.getTime() - b.getTime());


    const minDate = filteredDates.length ? filteredDates[0] : null;
    const maxDate = filteredDates.length ? filteredDates[filteredDates.length - 1] : null;

    const from = minDate ? minDate.toLocaleDateString('en-GB') : '...';
    const to = maxDate ? maxDate.toLocaleDateString('en-GB') : '...';

    // Generated Timestamp
    const generated = new Date().toLocaleString();

    // --- Date Range & Generated Date ---
    doc.setFontSize(10);
    doc.text(`From: ${from}   To: ${to}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Printed On: ${generated}`, pageWidth - 10, pageHeight - 10, { align: 'right' });

    // --- Table ---
    autoTable(doc, {
      startY: 40,
      head: [['Sr No', 'Tenant Name', 'Flat No', 'Mobile', 'Email', 'Building', 'Registration Date']],
      body: this.filteredData.map((r, index) => [
        index + 1,
        r.shortName,
        r.flatNumber,
        r.mobileNo,
        r.emailID,
        r.buildingName,
        r.registrationIssueDate ? new Date(r.registrationIssueDate).toLocaleDateString('en-GB') : ''
      ]),
      theme: 'grid',
      headStyles: { fillColor: [220,220,220], textColor: 0, halign: 'center', fontStyle: 'bold', fontSize: 9 },
       bodyStyles: {
    fontSize: 9,                 // ⬅ increase
    textColor: [0, 0, 0],         // ⬅ force black
    fontStyle: 'normal'
  },

      styles: { font: 'helvetica', overflow: 'linebreak', cellPadding: 2 },
      didDrawPage: (data) => {
        const currentPage = data.pageNumber;
        const pageCount = (doc as any).internal.pages.length - 1;

        // --- Footer ---
        doc.setFontSize(9);
        doc.text(`Page ${currentPage} of ${pageCount}`, pageWidth - 10, pageHeight - 20, { align: 'right' });
        doc.text('© IDS ID Smart Tech', 10, pageHeight - 10);
      }
    });

    doc.save('TenantReport.pdf');
  };
}



  exportExcel() {
  if (!this.filteredData || this.filteredData.length === 0) return;

  const excelData = this.filteredData.map((r, index) => ({
    'SrNo': index + 1,
    'IDNo': r.idNumber || '',
    'TagNo': r.tagNumber || '',
    'PANNo': r.paNnumber || '',
    'PassportNo': r.passportNo || '',
    'LicenseNo': r.licenseNo || '',
    'ICENo': r.icEno || '',
    'AadharID': r.aadharCardId || '',
    'VoterID': r.voterID || '',
    'FirstName': r.firstName || '',
    'MiddleName': r.middleName || '',
    'LastName': r.lastName || '',
    'ShortName': r.shortName || '',
    'Gender': r.gender || '',
    'BloodGrp': r.bloodGroup || '',
    'DOB': r.dob ? new Date(r.dob).toLocaleDateString('en-GB') : '',
    'EmailID': r.emailID || '',
    'MobileNo': r.mobileNo || '',
    'Landline': r.landLine || '',
    'FlatNo': r.flatNumber || '',
    'CardIssueDate': r.cardIssueDate ? new Date(r.cardIssueDate).toLocaleDateString('en-GB') : '',
    'CardPrintDate': r.cardPrintingDate ? new Date(r.cardPrintingDate).toLocaleDateString('en-GB') : '',
    'RegIssueDate': r.registrationIssueDate ? new Date(r.registrationIssueDate).toLocaleDateString('en-GB') : '',
    'AgreementFrom': r.aggreement_From ? new Date(r.aggreement_From).toLocaleDateString('en-GB') : '',
    'AgreementTo': r.aggreement_To ? new Date(r.aggreement_To).toLocaleDateString('en-GB') : '',
    'BuildingName': r.buildingName || '',
    'ProjectNRD': r.nrdName || ''
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);

  // Apply bold and larger font to header row
  const range = XLSX.utils.decode_range(ws['!ref']!);
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[cellAddress]) continue;
    ws[cellAddress].s = {
      font: { bold: true, sz: 14 }, // bold and font size 14
      alignment: { horizontal: 'center' }
    };
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tenant Report');

  // Write with cell styles
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  saveAs(new Blob([buffer]), 'TenantReport.xlsx');
}

}
