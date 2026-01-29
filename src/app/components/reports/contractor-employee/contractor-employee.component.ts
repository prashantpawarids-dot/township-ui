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
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from 'src/environments/environment';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';

@Component({
  selector: 'app-contractor-employee',
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
  templateUrl: './contractor-employee.component.html',
  styleUrls: ['../../../../table.css']
})
export class ContractorEmployeeComponent implements OnInit, AfterViewInit {

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
  { value: 'middleName', label: 'Middle Name' },
  { value: 'lastName', label: 'Last Name' },
  {value:'shortName',label:'Short Name'},
  { value: 'emailID', label: 'Email' },
  { value: 'mobileNo', label: 'Mobile Number' }
];


  neighbourhoodList: string[] = [];
  buildingList: string[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sortService: TableSortService
  ) {}

  ngOnInit(): void {
    let today = new Date();
    this.landOwnerForm = this.fb.group({
      searchBy: [''],
      searchText: [''],
      neighbourhood: [[]],
      building: [[]],
      fromDate: [today],
      toDate: [today]
    });

    this.loadNRDList();
    this.loadBuildingList();
    this.loadData();

    this.landOwnerForm.get('searchText')?.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged())
      .subscribe(() => this.applySearchByFilter());

    this.landOwnerForm.get('searchBy')?.valueChanges
      .subscribe(() => this.applySearchByFilter());

    this.dataSource.data = [];
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
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
    this.http.get<any[]>(`${environment.apiurl}Contractor`).subscribe({
      next: (res) => {
        this.allData = res || [];
      },
      error: (err) => console.error(err)
    });
  }

  public sortColumn(column: string) {
    if (this.sortService.getSortColumn() === column) {
      this.sortService.toggleDirection();
    } else {
      this.sortService.setSortColumn(column, 'asc');
    }

    this.dataSource.data = this.sortService.sortData([...this.dataSource.data], column);

    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  getSortColumn(): string {
    return this.sortService.getSortColumn();
  }

  getSortDirection(): 'asc' | 'desc' {
    return this.sortService.getSortDirection();
  }

  private applySearchByFilter() {
    const { searchBy, searchText } = this.landOwnerForm.value;
    let filtered = [...this.dataSource.data];

    if (searchText) {
      const text = searchText.toLowerCase();
      filtered = filtered.filter(x => x[searchBy]?.toString().toLowerCase().startsWith(text));
    }

    this.dataSource.data = filtered;
    this.paginator.firstPage();
  }

  onNeighbourhoodChange(event: any) {
    const selected = event.value;
    if (selected.includes('ALL')) {
      this.landOwnerForm.get('neighbourhood')?.setValue([...this.uniqueProjects]);
    }

    const selectedNeighbourhoods = this.landOwnerForm.value.neighbourhood || [];
    if (selectedNeighbourhoods.length === 0) {
      this.filteredBuildings = this.allBuildings.map(b => b.buildingName);
    } else {
      this.filteredBuildings = this.allBuildings
        .filter(b => selectedNeighbourhoods.includes(b.nrdName))
        .map(b => b.buildingName);
    }

    const selectedBuildings = this.landOwnerForm.value.building || [];
    const newSelection = selectedBuildings.filter(b => this.filteredBuildings.includes(b));
    this.landOwnerForm.patchValue({ building: newSelection });
  }

  onBuildingChange(event: any) {
    const selected = event.value;
    if (selected.includes('ALL')) {
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
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter(x => x.registrationIssueDate && new Date(x.registrationIssueDate) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter(x => x.registrationIssueDate && new Date(x.registrationIssueDate) <= to);
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

    this.filteredData = filtered;
    this.dataSource.data = filtered;
    this.paginator.firstPage();
  }

  showAll() {
    this.landOwnerForm.reset({
      searchBy: '',
      searchText: '',
      neighbourhood: [],
      building: [],
      fromDate: '',
      toDate: ''
    });

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
  if (!this.filteredData || this.filteredData.length === 0) return;

  const doc = new jsPDF('l', 'mm', 'a4');
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  logo.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo
    doc.addImage(logo, 'JPEG', 10, 10, 25, 25);

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('CONTRACTOR REPORT', pageWidth / 2, 25, { align: 'center' });

    // Printed Date
    const now = new Date();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Printed On: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      pageWidth - 10,
      20,
      { align: 'right' }
    );

    // 🔹 DOJ Min–Max calculation
    const dates = this.filteredData
      .map(e => e.registrationIssueDate ? new Date(e.registrationIssueDate) : null)
      .filter(d => d && !isNaN(d.getTime())) as Date[];

    const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    const from = minDate ? minDate.toLocaleDateString('en-GB') : 'N/A';
    const to = maxDate ? maxDate.toLocaleDateString('en-GB') : 'N/A';

    // Show From–To
    doc.text(`From: ${from}  -  To: ${to}`, pageWidth / 2, 32, { align: 'center' });

    autoTable(doc, {
  startY: 40,
  head: [[
    'SR NO',
    'FIRST NAME',
    'MIDDLE NAME',
    'LAST NAME',
    'SHORT NAME',
    'GENDER',
    'EMAIL',
    'MOBILE',
    'ADDRESS',
    'REGISTRATION DATE'
  ]],
  body: this.filteredData.map((r, i) => [
    i + 1,
    r.firstName || '',
    r.middleName || '',
    r.lastName || '',
    r.shortName||'',
    r.gender || '',
    r.emailID || '',
    r.mobileNo || '',
    r.address||'',
    r.registrationIssueDate ? new Date(r.registrationIssueDate).toLocaleDateString('en-GB') : 'N/A'
  ]),
  headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
  bodyStyles: { fontSize: 9, textColor: [0, 0, 0] }
});

    doc.save('CONTRACTOR.pdf');
  };
}


 exportExcel() {
  if (!this.filteredData || this.filteredData.length === 0) return;

  const printedDate = new Date().toLocaleString();

  // 🔹 DOJ Min–Max
  const dates = this.filteredData
    .map(e => e.registrationIssueDate ? new Date(e.registrationIssueDate) : null)
    .filter(d => d && !isNaN(d.getTime())) as Date[];

  const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
  const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

  const from = minDate ? minDate.toLocaleDateString('en-GB') : 'N/A';
  const to = maxDate ? maxDate.toLocaleDateString('en-GB') : 'N/A';

  const excelData = this.filteredData.map((r, i) => ({
  'SR NO': i + 1,
  'FIRST NAME': r.firstName,
  'MIDDLE NAME': r.middleName,
  'LAST NAME': r.lastName,
  'SHORT NAME': r.shortName || '',
  'GENDER': r.gender,
  'EMAIL': r.emailID,
  'MOBILE': r.mobileNo,
  'ADDRESS': r.address || '',
  'REGISTRATION DATE': r.registrationIssueDate ? new Date(r.registrationIssueDate).toLocaleDateString('en-GB') : 'N/A'
}));


  const wb = XLSX.utils.book_new();

  const wsData: any[][] = [
    ['CONTRACTOR REPORT', '', '', '', '', '', '', '', `From: ${from} - To: ${to}`, `Printed On: ${printedDate}`],
    [],
    Object.keys(excelData[0])
  ];

  excelData.forEach(r => wsData.push(Object.values(r)));

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Title style
  ws['A1'].s = {
    font: { bold: true, sz: 18 },
    alignment: { horizontal: 'center' }
  };

  ws['!merges'] = ws['!merges'] || [];
  ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } });

  // Header styling
  const headers = Object.keys(excelData[0]);
  headers.forEach((_, i) => {
    const cell = XLSX.utils.encode_cell({ r: 2, c: i });
    ws[cell].s = {
      font: { bold: true },
      alignment: { horizontal: 'center' },
      fill: { fgColor: { rgb: 'DDEBF7' } }
    };
  });

  ws['!cols'] = headers.map(h => ({ wch: h.length + 18 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Employee Report');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer]), 'CONTRACTOR.xlsx');
}


}
