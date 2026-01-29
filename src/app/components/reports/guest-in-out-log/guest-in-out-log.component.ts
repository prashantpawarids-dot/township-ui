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
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { sortByTimeOnly } from 'src/app/_core/shared/utils/sort.util';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import { DateTimeUtil } from 'src/app/_core/shared/utils/datetime.util';
@Component({
  selector: 'app-guest-in-out-log',
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
  templateUrl: './guest-in-out-log.component.html',
  styleUrls: ['../../../../table.css']
})
export class GuestInOutLogComponent implements OnInit, AfterViewInit {

  guestLogForm!: FormGroup;

  searchType = [
    { value: 'shortName', label: 'Short Name' },
    { value: 'mobileNo', label: 'Mobile' },
    { value: 'flatNumber', label: 'Flat Number' },
    { value: 'buildingName', label: 'Building Name' },
    { value: 'nrdName', label: 'NRD Name' }
  ];

  allData: any[] = [];
  buildings: any[] = [];
  neighbourhoods: any[] = [];
filteredData:any[]=[];
  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, private http: HttpClient,private sortService: TableSortService) {}

  ngOnInit(): void {
    let today=new Date();
    this.guestLogForm = this.fb.group({
      searchType: [''],
      searchText: [''],
      fromDate: [today],
      toDate: [today],
      buildingName: [[]],
      nrdName: [[]]
    });

    this.loadData();

    
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  loadData() {
    this.http.get<any[]>(`${environment.apiurl}Guest`).subscribe({
      next: (res) => {
        this.allData = res || [];
        this.dataSource.data = []; // Initially empty (headers + "No Data")
        this.extractFilters();
      },
      error: (err) => console.error(err)
    });
  }

  extractFilters() {
    // Unique Buildings
    this.buildings = Array.from(new Set(this.allData.map(d => d.buildingName).filter(Boolean)))
      .map(b => ({ value: b, label: b }));
    // Unique Neighbourhoods
    this.neighbourhoods = Array.from(new Set(this.allData.map(d => d.nrdName).filter(Boolean)))
      .map(n => ({ value: n, label: n }));
  }

  stripTime(d: Date): number {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  }

  applyFilters() {
  const f = this.guestLogForm.value;
  let filtered = [...this.allData];

  // --- Multi-select filters ---
  if (f.buildingName?.length) {
    filtered = filtered.filter(x =>
      f.buildingName.some(b => b.toLowerCase() === (x.buildingName || '').toLowerCase())
    );
  }
  if (f.nrdName?.length) {
    filtered = filtered.filter(x =>
      f.nrdName.some(n => n.toLowerCase() === (x.nrdName || '').toLowerCase())
    );
  }

  // --- Date filters ---
  const from = f.fromDate ? new Date(f.fromDate) : null;
  const to = f.toDate ? new Date(f.toDate) : null;

  if (from) from.setHours(0, 0, 0, 0);
  if (to) to.setHours(23, 59, 59, 999);

  if (from || to) {
    filtered = filtered.filter(item => {
      const validFrom = item.validFrom ? new Date(item.validFrom) : null;
      const validTo = item.validTill ? new Date(item.validTill) : null;

      if (!validFrom || !validTo) return false;

      // overlap check
      return (!from || validTo >= from) && (!to || validFrom <= to);
    });
  }

  // --- Search text filter ---
if (f.searchText?.trim() !== '') {
  if (!f.searchType) {
    alert('Please select a search type');
    this.dataSource.data = [];
    this.filteredData = [];
    return;
  }

  const txt = f.searchText.trim().toLowerCase();
  filtered = filtered.filter(item =>
    item[f.searchType]?.toString().toLowerCase().startsWith(txt)
  );
}


  // --- Apply filtered data ---
  this.dataSource.data = filtered;
  this.filteredData = filtered;
  if (this.paginator) this.paginator.firstPage();
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
  showAll() {
    this.guestLogForm.reset({
      searchType: '',
      searchText: '',
      fromDate: '',
      toDate: '',
      buildingName: [],
      nrdName: []
    });
    this.dataSource.data = [];
    if (this.paginator) this.paginator.firstPage();
  }


  private getDateRange() {
  const data = this.dataSource.data;

  if (!data.length) {
    return { from: '', to: '' };
  }

  const fromDates = data
    .filter(x => x.validFrom)
    .map(x => new Date(x.validFrom).getTime());

  const toDates = data
    .filter(x => x.validTill)
    .map(x => new Date(x.validTill).getTime());

  const minFrom = fromDates.length ? new Date(Math.min(...fromDates)) : null;
  const maxTo = toDates.length ? new Date(Math.max(...toDates)) : null;

  return {
    from: minFrom ? minFrom.toLocaleDateString() : '',
    to: maxTo ? maxTo.toLocaleDateString() : ''
  };
}


  exportPDF() {
  if (!this.filteredData.length) return;

  const doc = new jsPDF('l');
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  const generatedDate = `Printed on: ${new Date().toLocaleString()}`;
  const dateRange = this.getDateRange();

  logo.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    /* ---------------- HEADER ---------------- */

    // Logo
    doc.addImage(logo, 'JPEG', 10, 10, 25, 25);

    // Title
    doc.setFont(undefined, 'bold');
    doc.setFontSize(18);
    doc.text('Guest In-Out Log Report', pageWidth / 2, 20, { align: 'center' });

    // Date Range (below title)
    doc.setFontSize(12);
    doc.text(
      `From: ${dateRange.from}    To: ${dateRange.to}`,
      pageWidth / 2,
      28,
      { align: 'center' }
    );

    // Generated On (top-right)
    doc.setFontSize(10);
    doc.text(
      generatedDate,
      pageWidth - 10,
      15,
      { align: 'right' }
    );

    /* ---------------- TABLE ---------------- */

    autoTable(doc, {
      startY: 40,
      head: [[
        'SrNo',
        'Short Name',
        'Mobile',
        'Flat Number',
        'Valid From',
        'Valid Till',
        'Building Name',
        'NRD Name'
      ]],
      body: this.filteredData.map((r, i) => [
        i + 1,
        r.shortName,
        r.mobileNo,
        r.flatNumber,
        r.validFrom ? new Date(r.validFrom).toLocaleDateString() : '',
        r.validTill ? new Date(r.validTill).toLocaleDateString() : '',
        r.buildingName,
        r.nrdName
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        fontStyle: 'bold',
        halign: 'center'
      },
       bodyStyles: {
    fontSize: 9,                 // ⬅ increase
    textColor: [0, 0, 0],         // ⬅ force black
    fontStyle: 'normal'
  },


      /* -------- FOOTER ON EVERY PAGE -------- */
      didDrawPage: () => {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const pageNumber = doc.internal.pages.length - 1;

  doc.setFontSize(9);

  // Bottom-left copyright
  doc.text(
    '© IDS ID SMART Tech',
    10,
    pageHeight - 10
  );

  // Bottom-center page number
  doc.text(
    `Page ${pageNumber}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );
}

    });

    doc.save('GuestInOutLogReport.pdf');
  };
}


  /** ------------------- Excel Export ------------------- */
exportExcel() {
  if (!this.filteredData.length) return;

  const printedDate = new Date().toLocaleString();

  const excelData = this.filteredData.map((r, i) => ({
    'Sr No': i + 1,
    'Short Name': r.shortName || '',
    'Mobile': r.mobileNo || '',
    'Flat Number': r.flatNumber || '',
    'Valid From': r.validFrom ? DateTimeUtil.formatDateTime(r.validFrom) : '',
'Valid Till': r.validTill ? DateTimeUtil.formatDateTime(r.validTill) : '',

    'Building Name': r.buildingName || '',
    'NRD Name': r.nrdName || ''
  }));

  const wb = XLSX.utils.book_new();

  /* ---------- Worksheet Layout ---------- */
  const wsData: any[][] = [
    ['GUEST IN-OUT LOG REPORT', '', '', '', '', '', '', `Printed On: ${printedDate}`],
    [],
    Object.keys(excelData[0])
  ];

  excelData.forEach(row => wsData.push(Object.values(row)));

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  /* ---------- Title Styling ---------- */
  ws['A1'].s = {
    font: { bold: true, sz: 20 },
    alignment: { horizontal: 'center' }
  };

  const totalColumns = Object.keys(excelData[0]).length;

  ws['!merges'] = ws['!merges'] || [];
  ws['!merges'].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: totalColumns - 2 }
  });

  /* ---------- Printed Date (Top Right) ---------- */
  const printedCell = XLSX.utils.encode_cell({ r: 0, c: totalColumns - 1 });
  ws[printedCell].s = {
    font: { bold: true, sz: 12 },
    alignment: { horizontal: 'right' }
  };

  /* ---------- Header Styling ---------- */
  const headers = Object.keys(excelData[0]);

  headers.forEach((_, idx) => {
    const cell = XLSX.utils.encode_cell({ r: 2, c: idx });
    ws[cell].s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: 'center' },
      fill: { fgColor: { rgb: 'DDEBF7' } },
      border: {
        top: { style: 'thin', color: { rgb: '000000' } },
        bottom: { style: 'thin', color: { rgb: '000000' } },
        left: { style: 'thin', color: { rgb: '000000' } },
        right: { style: 'thin', color: { rgb: '000000' } }
      }
    };
  });

  /* ---------- Auto Column Width ---------- */
  ws['!cols'] = headers.map(h => ({ wch: h.length + 15 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Guest In-Out Log');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer]), 'GuestInOutLogReport.xlsx');
}


}
