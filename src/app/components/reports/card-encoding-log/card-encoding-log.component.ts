import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import { DateTimeUtil } from 'src/app/_core/shared/utils/datetime.util';
@Component({
  selector: 'app-card-encoding-log',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './card-encoding-log.component.html',
  styleUrl: '../../../../table.css'
})
export class CardEncodingLogComponent implements OnInit {

  reportForm: FormGroup;
  allData: any[] = [];
  filteredData: any[] = [];
  displayedData: any[] = [];
  pageSizes = [10, 20, 50, 100,150,200];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  cardTypes = [
    { value: 'Resident', label: 'Resident' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'Service provider', label: 'Service provider' },
    { value: 'Contractor Employee', label: 'Employee' },
    { value: 'Land Owner', label: 'Land Owner' },
    { value: 'Guest', label: 'Guest' }
  ];

  // Mapping for logical API values
  cardTypeMap: { [key: string]: string[] } = {
    'Resident': ['DResident', 'PResident'],
    'Tenant': ['DTenant', 'PTenant'],
    'Service provider': ['SProvider'],
    'Contractor Employee': ['Employee'],
    'Land Owner': ['DLandOwner', 'PLandOwner'],
    'Guest': ['Guest']
  };

  constructor(private fb: FormBuilder, private http: HttpClient ,private sortService: TableSortService) {
    let today=new Date();
this.reportForm = this.fb.group({
  dateField: ['cardIssueDate'], // default
  fromDate: [today],
  toDate: [today],
  cardType: [[]],
  searchBy: [''],
  searchValue: ['']
});


  }

  ngOnInit() {
    this.loadAllCardData();
  }

  private loadAllCardData(): void {
    this.http.get<any[]>(`${environment.apiurl}Report/CardEncodingLog`).subscribe({
      next: data => {
        this.allData = data;
        this.filteredData = [];
        this.displayedData = [];
      },
      error: err => {
        console.error('Failed to load card data:', err);
        this.allData = [];
        this.filteredData = [];
        this.displayedData = [];
      }
    });
  }
onCardTypeChange(event: any) {
  const selected = event.value;

  // If "All" is selected, select all real card types
  if (selected.includes('all')) {
    this.reportForm.get('cardType')?.setValue(
      this.cardTypes.map(ct => ct.value),
      { emitEvent: false }
    );
  } else {
    // Keep selected values, remove "all" if deselected
    this.reportForm.get('cardType')?.setValue(selected, { emitEvent: false });
  }
}

  applyFilters(): void {
  const { dateField, fromDate, toDate, cardType, searchBy, searchValue } = this.reportForm.value;
  let filtered = [...this.allData];

  // CARD TYPE FILTER
  if (cardType && cardType.length > 0) {
    let apiTypes: string[] = [];
    if (cardType.includes('all')) {
      apiTypes = this.allData.map(d => d.cardType);
    } else {
      cardType.forEach(ct => apiTypes = apiTypes.concat(this.cardTypeMap[ct] || []));
    }
    apiTypes = [...new Set(apiTypes)];
    filtered = filtered.filter(d => apiTypes.includes(d.cardType));
  }

  // DATE FILTERS
  if (fromDate) {
    const from = new Date(fromDate); from.setHours(0,0,0,0);
    filtered = filtered.filter(d => {
      const fieldDate = d[dateField] ? new Date(d[dateField]) : null;
      return fieldDate ? fieldDate >= from : false;
    });
  }

  if (toDate) {
    const to = new Date(toDate); to.setHours(23,59,59,999);
    filtered = filtered.filter(d => {
      const fieldDate = d[dateField] ? new Date(d[dateField]) : null;
      return fieldDate ? fieldDate <= to : false;
    });
  }

  // SEARCH FILTER
if (searchValue && searchValue.trim().length > 0) {
  if (!searchBy) {
    alert('Please select a search type');   // ⚠ alert
    this.filteredData = [];                 // ⚠ clear
    this.displayedData = [];                // ⚠ clear table
    return;                                 // ⚠ stop execution
  }

  const searchLower = searchValue.toLowerCase();
  filtered = filtered.filter(d =>
    d[searchBy]?.toString().toLowerCase().startsWith(searchLower)
  );
}


 this.filteredData = filtered;

// ✅ TELL Paginator total records
this.paginator.length = this.filteredData.length;

this.paginator.firstPage();
this.updateDisplayedData(0, this.paginator.pageSize || this.pageSizes[0]);

}

public sortColumn(column: string) {
  // Check if the clicked column is the same as the last sorted column
  if (this.sortService.getSortColumn() === column) {
    this.sortService.toggleDirection();
  } else {
    this.sortService.setSortColumn(column, 'asc');
  }

  // Apply sorting to the array directly (no `.data`)
  this.filteredData = this.sortService.sortData([...this.filteredData], column);

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

  showAll(): void {
    this.reportForm.reset({ cardType: [] });
    this.filteredData = [];
    this.displayedData = [];
  }

  onPageChange(event: PageEvent): void {
    this.updateDisplayedData(event.pageIndex, event.pageSize);
  }

  private updateDisplayedData(pageIndex: number, pageSize: number): void {
    const start = pageIndex * pageSize;
    const end = start + pageSize;
    this.displayedData = this.filteredData.slice(start, end);
  }

  getSrNo(index: number): number {
    return this.paginator ? this.paginator.pageIndex * this.paginator.pageSize + index + 1 : index + 1;
  }

  exportReports() {
  if (!this.filteredData.length) return;

  const generated = new Date().toLocaleString();
  const doc = new jsPDF('l', 'mm', 'a4');
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  // Get selected date field from form
  const dateField = this.reportForm.get('dateField')?.value || 'cardIssueDate';

  // Compute min & max dates based on selected date field
  const dates = this.filteredData
    .map(d => d[dateField] ? new Date(d[dateField]) : null)
    .filter(d => d !== null) as Date[];

  const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
  const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

  const dateRangeText = minDate && maxDate 
    ? `${dateField === 'cardIssueDate' ? 'Card Issue Date' : 'Valid Till'} From: ${minDate.toLocaleDateString()} - To: ${maxDate.toLocaleDateString()}` 
    : '';

  logo.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Logo + Title
    doc.addImage(logo, 'JPEG', 10, 10, 15, 15);
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('CARD ENCODING', pageWidth / 2, 20, { align: 'center' });

    // Date Range below heading
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    if (dateRangeText) {
      doc.text(dateRangeText, pageWidth / 2, 28, { align: 'center' });
    }

    // Printed On
    doc.setFontSize(10);
    doc.text(`Printed On: ${generated}`, pageWidth - 10, 20, { align: 'right' });

    // Table Body
    const body = this.filteredData.map((d, i) => [
      i + 1,
      d.idNumber || '',
      d.shortname || '',
      d.csn || '',
      d.cardType || '',
      d.cardIssueDate ? new Date(d.cardIssueDate).toLocaleString() : '',
      d.validTill ? new Date(d.validTill).toLocaleString() : '',
      d.status || ''
    ]);

    autoTable(doc, {
      startY: 35,
      head: [['Sr No', 'ID Number', 'Short Name', 'CSN', 'Card Type', 'Card Issue Date', 'Valid Till', 'Status']],
      body,
      theme: 'grid',
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
       bodyStyles: {
    fontSize: 9,                 // ⬅ increase
    textColor: [0, 0, 0],         // ⬅ force black
    fontStyle: 'normal'
  },


      didDrawPage: (data) => {
        doc.setFontSize(10);
        doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        doc.text('©IDS ID SMART TECH', 10, pageHeight - 10);
      }
    });

    doc.save('CardEncodingLogs.pdf');
  };
}


// ------------------- Excel Export (Updated Design) -------------------
exportToExcel() {
  if (!this.filteredData.length) return;

  const printedDate = new Date().toLocaleString();

  const excelData = this.filteredData.map((d, i) => ({
    'Sr No': i + 1,
    'ID Number': d.idNumber || '',
    'Short Name': d.shortname || '',
    'CSN': d.csn || '',
    'Card Type': d.cardType || '',
    'Card Issue Date': d.cardIssueDate ? DateTimeUtil.formatDateTime(d.cardIssueDate) : '',
'Valid Till': d.validTill ? DateTimeUtil.formatDateTime(d.validTill) : '',

    'Status': d.status || ''
  }));

  const wb = XLSX.utils.book_new();

  const wsData: any[][] = [
    ["CARD ENCODING", "", "", "", "", "", "", "", `Printed On: ${printedDate}`],
    [],
    Object.keys(excelData[0])
  ];

  excelData.forEach(row => wsData.push(Object.values(row)));

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Title Styling
  ws["A1"].s = { font: { bold: true, sz: 20 }, alignment: { horizontal: "center" } };
  const totalCols = Object.keys(excelData[0]).length;
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 2 } }];

  // Printed Date Styling
  const printedCell = XLSX.utils.encode_cell({ r: 0, c: totalCols - 1 });
  ws[printedCell].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: "right" } };

  // Header Row Styling
  const headers = Object.keys(excelData[0]);
  headers.forEach((h, i) => {
    const cell = XLSX.utils.encode_cell({ r: 2, c: i });
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

  // Auto Width
  ws["!cols"] = headers.map(h => ({ wch: h.length + 15 }));

  XLSX.utils.book_append_sheet(wb, ws, "CardEncodingLogs");
  const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  saveAs(new Blob([buffer]), "CardEncodingLogs.xlsx");
}


}
