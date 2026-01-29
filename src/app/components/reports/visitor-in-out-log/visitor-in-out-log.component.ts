import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DateTimeUtil } from 'src/app/_core/shared/utils/datetime.util';
@Component({
  selector: 'app-visitor-in-out-log',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,

    MatPaginatorModule,
    HttpClientModule
  ],
  templateUrl: './visitor-in-out-log.component.html',
  styleUrls: ['../../../../table.css']
})
export class VisitorInOutLogComponent implements OnInit, AfterViewInit {

  reportForm: FormGroup;
  visitorData: any[] = [];
  filteredData: any[] = [];
  displayedData = new MatTableDataSource<any>([]);
  pageSizes = [10, 25, 50];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchTypeOptions = [
  { value: 'shortName', label: 'Visitor Name' },
  { value: 'mobileNo', label: 'Mobile No' },
  { value: 'visitPurpose', label: 'Purpose' },
  { value: 'visitDescription', label: 'Description' },
  { value: 'visitStatus', label: 'Status' }
];


  nrdList: string[] = [];
  buildingList: string[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient ,private sortService: TableSortService) {
    let today=new Date();
    this.reportForm = this.fb.group({
      
      fromDate: [today],
      toDate: [today],
      searchType: [''],
      searchText: [''],
      nrd: [[]],
      building: [[]]
    });
  }

// Simple arrays
neighbourhoods: string[] = [];
allBuildings: string[] = [];
buildings: string[] = [];

ngOnInit() {
  this.loadNRDList();
  this.loadBuildingList();
  this.loadVisitorData();

  // Auto-filter
  this.reportForm.get('searchText')?.valueChanges.subscribe(() => this.applyFilters());
  this.reportForm.get('searchType')?.valueChanges.subscribe(() => this.applyFilters());
}

loadNRDList() {
  this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe(res => {
    // Only names as strings
    this.neighbourhoods = res.map(n => n.name);
  });
}

loadBuildingList() {
  this.http.get<any[]>(`${environment.apiurl}Building`).subscribe(res => {
    this.allBuildings = res.map(b => b.name);  // simple array of strings
    this.buildings = [...this.allBuildings];   // optionally filtered subset
  });
}

onNRDSelect(event: any) {
  const selectedNRDs: string[] = event.value;

  if (selectedNRDs.includes('All')) {
    this.reportForm.get('nrd')?.setValue([...this.neighbourhoods]);
    this.buildings = [...this.allBuildings]; // show all buildings if All NRD is selected
    return;
  }

  // Filter buildings based on selected NRDs
  this.buildings = Array.from(
    new Set(
      this.visitorData
        .filter(v => selectedNRDs.includes(v.nrdName))
        .map(v => v.buildingName)
    )
  );

  // Optionally, reset building selection if current selection is no longer valid
  const currentBuildings: string[] = this.reportForm.get('building')?.value || [];
  const validBuildings = currentBuildings.filter(b => this.buildings.includes(b));
  this.reportForm.get('building')?.setValue(validBuildings);
}

onBuildingSelect(event: any) {
  const selected = event.value;
  if (selected.includes('All')) {
    this.reportForm.get('building')?.setValue([...this.buildings]);
  }
}



  ngAfterViewInit() {
    this.displayedData.paginator = this.paginator;
  }

  loadVisitorData() {
    const apiUrl = `${environment.apiurl}Visitor`;

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.visitorData = data.map(v => ({
            shortName: v.shortName || '',
            mobileNo: v.mobileNo || '',
            visitStartTime: v.visitStartTime ? new Date(v.visitStartTime) : null,
            visitEndTime: v.visitEndTime ? new Date(v.visitEndTime) : null,
            visitPurpose: v.visitPurpose || '',
            visitDescription: v.visitDescription || '',
            visitStatus: v.visitStatus || '',
            nrdName: v.nrdName || '',
            buildingName: v.buildingName || ''
          }));

          // Populate unique NRD and Building lists
          this.nrdList = Array.from(new Set(this.visitorData.map(v => v.nrdName))).filter(x => x);
          this.buildingList = Array.from(new Set(this.visitorData.map(v => v.buildingName))).filter(x => x);

          // Initially, show NO DATA
          this.filteredData = [];
          this.displayedData.data = [];
        }
      },
      error: (err) => console.error('Error fetching Visitor Data:', err)
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
  showReports() {
    let filtered = [...this.visitorData];
    const { fromDate, toDate, nrd, building } = this.reportForm.value;

    if (fromDate) filtered = filtered.filter(v => v.visitStartTime && new Date(v.visitStartTime) >= new Date(fromDate));
if (toDate) {
    const t = new Date(toDate);
    t.setHours(23, 59, 59, 999);
    filtered = filtered.filter(v => v.visitEndTime && new Date(v.visitEndTime) <= t);
}


    if (nrd && nrd.length > 0) filtered = filtered.filter(v => nrd.includes(v.nrdName));
    if (building && building.length > 0) filtered = filtered.filter(v => building.includes(v.buildingName));

    this.filteredData = filtered;
    this.applyFilters(true);
  }

  showAll() {
    this.reportForm.reset({ nrd: [], building: [], searchType: '', searchText: '', fromDate: '', toDate: '' });
   
    if (this.paginator) this.paginator.firstPage();
  }

 private applyFilters(fromShowButton: boolean = false) {
  const { searchType, searchText } = this.reportForm.value;
  let data = [...this.filteredData];

  if (searchText && searchText.trim().length > 0) {
    if (!searchType) {
      alert('Please select a search type');   // ⚠ alert
      this.displayedData.data = [];           // ⚠ clear table
      return;                                 // ⚠ stop execution
    }

    const lowerText = searchText.toLowerCase();

    data = data.filter(v =>
      (v[searchType] || '')
        .toString()
        .toLowerCase()
        .startsWith(lowerText)   // ✅ same behavior as your vehicle code
    );
  }

  this.displayedData.data = data;

  if (this.paginator && fromShowButton) {
    this.paginator.firstPage();
  }
}


  getSrNo(index: number): number {
    if (!this.paginator) return index + 1;
    return (this.paginator.pageIndex * this.paginator.pageSize) + index + 1;
  }

  exportReports() {
  if (!this.filteredData || this.filteredData.length === 0) return;

  const doc = new jsPDF('l', 'mm', 'a4');

  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  logo.onload = () => {
    // Add logo at top-left
    doc.addImage(logo, 'JPEG', 10, 10, 25, 25);

    const pageWidth = doc.internal.pageSize.getWidth();

    // Add title centered
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('VISITOR REPORT', pageWidth / 2, 25, { align: 'center' });

    // Add printed date at top-right
    const now = new Date();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Printed: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, pageWidth - 10, 20, { align: 'right' });

    // Calculate min/max date from displayed data
    const dates = this.filteredData
      .map(v => new Date(v.visitStartTime))
      .filter(d => !isNaN(d.getTime()));

    const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    const from = minDate ? minDate.toLocaleDateString('en-GB') : 'N/A';
    const to = maxDate ? maxDate.toLocaleDateString('en-GB') : 'N/A';

    // Show From–To date below title
    doc.text(`From: ${from}  -  To: ${to}`, pageWidth / 2, 32, { align: 'center' });

    // Add table
    autoTable(doc, {
      startY: 40,
      head: [[
        'SR NO', 'SHORT NAME', 'MOBILE NO', 'VISIT START TIME', 'VISIT END TIME',
        'PURPOSE', 'DESCRIPTION', 'STATUS', 'NRD NAME', 'BUILDING NAME'
      ]],
      body: this.filteredData.map((v, i) => [
        i + 1,
        v.shortName || 'N/A',
        v.mobileNo || 'N/A',
        v.visitStartTime ? new Date(v.visitStartTime).toLocaleString('en-GB') : 'N/A',
        v.visitEndTime ? new Date(v.visitEndTime).toLocaleString('en-GB') : 'N/A',
        v.visitPurpose || 'N/A',
        v.visitDescription || 'N/A',

        v.visitStatus || 'N/A',
        v.nrdName || 'N/A',
        v.buildingName || 'N/A'
      ]),
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
       bodyStyles: {
    fontSize: 9,                 // ⬅ increase
    textColor: [0, 0, 0],         // ⬅ force black
    fontStyle: 'normal'
  },

      didDrawPage: (data) => {
        const pageCount = doc.getNumberOfPages();
        const currentPage = doc.getCurrentPageInfo().pageNumber;
        const pageHeight = doc.internal.pageSize.getHeight();

        doc.setFontSize(10);
        doc.text(`Page ${currentPage} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text(`©Ids Id Smart Tech`, 10, pageHeight - 10);
      }
    });

    doc.save('VisitorReport.pdf');
  };
}



  exportExcel() {
  if (!this.filteredData || this.filteredData.length === 0) return;

  const printedDate = new Date().toLocaleString();

  const excelData = this.filteredData.map((v, i) => ({
    'SR NO': i + 1,
    'SHORT NAME': v.shortName || 'N/A',
    'MOBILE NO': v.mobileNo || 'N/A',
    'VISIT START TIME': v.visitStartTime ? DateTimeUtil.formatDateTime(v.visitStartTime) : 'N/A',
'VISIT END TIME': v.visitEndTime ? DateTimeUtil.formatDateTime(v.visitEndTime) : 'N/A',

    'PURPOSE': v.visitPurpose || 'N/A',
    'DESCRIPTION':v.visitDescription || 'N/A',
    'STATUS': v.visitStatus || 'N/A',
    'NRD NAME': v.nrdName || 'N/A',
    'BUILDING NAME': v.buildingName || 'N/A'
  }));

  const wb = XLSX.utils.book_new();

  // Row 1 => Title + Printed Date
  const wsData: any[][] = [
    ["VISITOR REPORT", "", "", "", "", "", "", "", "", `Printed: ${printedDate}`],
    [],
    Object.keys(excelData[0])
  ];

  excelData.forEach(row => wsData.push(Object.values(row)));

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // -------------------------------------------------------
  // STYLE: TITLE (Row 1)
  // -------------------------------------------------------
  ws["A1"].s = {
    font: { bold: true, sz: 18 },
    alignment: { horizontal: "center" }
  };

  // Merge cells for centered heading (A1 to I1)
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: 8 }
  });

  // -------------------------------------------------------
  // STYLE: PRINTED DATE (Row 1, last column)
  // -------------------------------------------------------
  const printedCell = XLSX.utils.encode_cell({ r: 0, c: 9 });
  ws[printedCell].s = {
    font: { bold: true, sz: 12 },
    alignment: { horizontal: "right" }
  };

  // -------------------------------------------------------
  // STYLE: Header row (Row 3)
  // -------------------------------------------------------
  const headers = Object.keys(excelData[0]);
  headers.forEach((h, idx) => {
    const cell = XLSX.utils.encode_cell({ r: 2, c: idx });
    ws[cell].s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: "center" },
      fill: { fgColor: { rgb: "DDEBF7" } },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    };
  });

  // Auto column width
  ws["!cols"] = headers.map(h => ({ wch: h.length + 20 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Visitor Report');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer]), 'VisitorReport.xlsx');
}
}
