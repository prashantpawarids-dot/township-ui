import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { sortByTimeOnly } from 'src/app/_core/shared/utils/sort.util';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';
import { DateTimeUtil } from 'src/app/_core/shared/utils/datetime.util';
@Component({
  selector: 'app-vechile-list',
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
  templateUrl: './vechile-list.component.html',
  styleUrls: ['../../../../table.css']
})
export class VechileListComponent implements OnInit, AfterViewInit {

  reportForm: FormGroup;

  allData: any[] = [];
  displayedData = new MatTableDataSource<any>([]);
  uniqueNRD: string[] = [];
  nrdList: string[] = [];
filteredData: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, private http: HttpClient,private sortService: TableSortService) {
let today=new Date();
    this.reportForm = this.fb.group({
      searchBy: [''],
      searchText: [''],
      nrd: [[]],
      fromDate: [today],
      toDate: [today]
    });

  }

 ngOnInit() {
  this.loadAllData();
  this.loadNRDList(); 
}


  ngAfterViewInit() {
    this.displayedData.paginator = this.paginator;
  }

  /** LOAD DATA FROM NEW API */
  loadAllData() {
    this.http.get<any[]>(`${environment.apiurl}Vehicle`).subscribe(res => {

      // directly assign new API result
      this.allData = res;

      // get unique NRD
      this.uniqueNRD = [...new Set(res.map(x => x.nrd).filter(Boolean))];

      // do NOT show automatically
      this.displayedData.data = [];
    });
  }
 

loadNRDList() {
  this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe(res => {
    // Map the objects to strings
    this.nrdList = res.map(n => n.name) || [];

    // Add 'All' option at top
    this.nrdList.unshift('All');
  });
}

onNRDChange() {
  const selected = this.reportForm.value.nrd;
  if (selected.includes('All')) {
    this.reportForm.patchValue({ nrd: this.nrdList.filter(n => n !== 'All') });
  }
}



  /** SHOW BUTTON CLICK */
  filterData() {
    let filtered = [...this.allData];
    const f = this.reportForm.value;

    // NRD filter
    if (f.nrd.length > 0) {
      filtered = filtered.filter(x => f.nrd.includes(x.nrd));
    }

    // Date filter (createdon field)
if (f.fromDate) {
  const from = new Date(f.fromDate).getTime();
  filtered = filtered.filter(x => new Date(x.createdon).getTime() >= from);
}

if (f.toDate) {
  const to = new Date(f.toDate);
  // Include the entire day until 23:59:59.999
  to.setHours(23, 59, 59, 999);
  filtered = filtered.filter(x => new Date(x.createdon).getTime() <= to.getTime());
}


 // Search
if (f.searchText && f.searchText.toString().trim() !== '') {
  if (!f.searchBy) {
    alert('Please select a search type');   // ⚠ alert
    this.displayedData.data = [];           // ⚠ clear table
    return;                                 // ⚠ stop execution
  }

  const searchValue = f.searchText.toString().toLowerCase();
  filtered = filtered.filter(x =>
    x[f.searchBy]?.toString().toLowerCase().startsWith(searchValue)
  );
}



    // Optional: sort by date
  filtered = sortByTimeOnly(filtered, 'createdon', 'asc');

  // ✅ Store filtered data separately
  this.filteredData = filtered;
  this.displayedData.data = filtered;

  if (this.paginator) this.paginator.firstPage();
  }

  /** RESET + SHOW ALL */
  showAll() {
    this.reportForm.reset({
      nrd: [],
      searchBy: '',
      searchText: '',
      fromDate: '',
      toDate: ''
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

  /** EXPORT EXCEL */
  exportExcel() {
  if (!this.filteredData.length) return;

  const f = this.reportForm.value;
  const from = f.fromDate ? new Date(f.fromDate).toLocaleDateString() : null;
  const to = f.toDate ? new Date(f.toDate).toLocaleDateString() : null;
  const generated = new Date().toLocaleString();

  // Table data
  const excelData = this.filteredData.map((v, i) => ({
    'SrNo': i + 1,
    'Reg No': v.regNo,
    'Short Name': v.shortname || '-',
    'Vehicle Type': v.vType,
    'Make': v.vMake,
    'Color': v.vColor,
    'Tag UID': v.tagUID,
    'Printed Tag ID': v.printedTagID || '-',
    'Sticker No': v.stickerNo || '-',
   
    'NRD': v.nrd || '-',
    'Building': v.building || '-',
    'Flat Number': v.flatNumber || '-',
    'Registration On': v.createdon ? DateTimeUtil.formatDateTime(v.createdon) : '-',

  }));

  // Header rows
  const header: any[] = [
    ['VEHICLE LIST REPORT'],   // Bold heading
  ];

  // Date Range if selected
  if (from && to) {
    header.push([`Date Range: ${from} to ${to}`]);
  }

  header.push([]); // Empty row before table

  // Convert header to sheet
  const ws = XLSX.utils.aoa_to_sheet(header);

  // Add table starting at row after header
  XLSX.utils.sheet_add_json(ws, excelData, { origin: header.length + 1 });

  // Merge heading across all columns
  const totalCols = Object.keys(excelData[0]).length;
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 1 } }];

  // Style for heading (bold, center)
  ws['A1'].s = { font: { bold: true, sz: 14 }, alignment: { horizontal: "center" } };

  // Auto column width
  ws['!cols'] = new Array(totalCols).fill({ wch: 20 });

  // Add Generated Date below table
  const genRow = header.length + excelData.length + 2;
  const genCell = `A${genRow}`;
  ws[genCell] = { v: `printed On: ${generated}`, t: 's', s: { alignment: { horizontal: "center" } } };
  ws['!merges'].push({ s: { r: genRow - 1, c: 0 }, e: { r: genRow - 1, c: totalCols - 1 } });

  // Save Excel
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'VehicleList');

  const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buf]), 'VehicleList.xlsx');
}


  exportPDF() {
  if (!this.filteredData.length) return;

  const doc = new jsPDF('l', 'mm', 'a4');
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  // Helper: Get min/max dates from displayed data
  const getMinMaxDates = (data: any[]): { min: Date | null; max: Date | null } => {
    if (!data || data.length === 0) return { min: null, max: null };
    const validDates = data
      .map(x => new Date(x.createdon))
      .filter(d => !isNaN(d.getTime()));
    const min = validDates.length ? new Date(Math.min(...validDates.map(d => d.getTime()))) : null;
    const max = validDates.length ? new Date(Math.max(...validDates.map(d => d.getTime()))) : null;
    return { min, max };
  };

  const { min, max } = getMinMaxDates(this.filteredData);
  const generated = new Date().toLocaleString();

  logo.onload = () => {
    // Top-left logo
    doc.addImage(logo, 'JPEG', 10, 10, 15, 15);

    // Top-right printed date/time
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    doc.text(`Printed On: ${generated}`, doc.internal.pageSize.getWidth() - 10, 20, { align: 'right' });

    // Heading
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('VEHICLE LIST REPORT', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    // Date range below heading
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    if (min && max) {
      const fromStr = min.toLocaleDateString();
      const toStr = max.toLocaleDateString();
      doc.text(`Date: ${fromStr} to ${toStr}`, doc.internal.pageSize.getWidth() / 2, 32, { align: 'center' });
    }

    // Table
    autoTable(doc, {
      startY: min && max ? 40 : 40,
      head: [[
        'SrNo', 'ID Number', 'Reg No', 'VType', 'Name', 'NRD', 'Building', 'Flat Number', 'Tag UID', 'Sticker No', 'Registration On'
      ]],
      body: this.filteredData.map((v, i) => [
        i + 1,
        v.idNumber || '-',
        v.regNo,
        v.vType,
        v.shortname || '-',
        v.nrd || '-',
        v.building || '-',
        v.flatNumber || '-',
        v.tagUID || '-',
        v.stickerNo || '-',
        v.createdon
      ]),
      theme: 'grid',
     headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
      bodyStyles: {
    fontSize: 9,                 // ⬅ increase
    textColor: [0, 0, 0],         // ⬅ force black
    fontStyle: 'normal'
  },


      didDrawPage: (data) => {
        // Bottom-left copyright
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        doc.text('©IDS ID Smart Tech', 10, doc.internal.pageSize.height - 10);

        // Bottom-right page number
        const pageCount = (doc as any).internal.pages.length - 1;
        const currentPage = data.pageNumber;
        doc.text(`Page ${currentPage} of ${pageCount}`, doc.internal.pageSize.getWidth() - 10, doc.internal.pageSize.height - 10, { align: 'right' });
      }
    });

    doc.save('VehicleList.pdf');
  };
}





}

