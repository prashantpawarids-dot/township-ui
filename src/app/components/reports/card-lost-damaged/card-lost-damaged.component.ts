import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import { DateTimeUtil } from 'src/app/_core/shared/utils/datetime.util';
@Component({
  selector: 'app-card-lost-damaged',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatRadioModule,
    MatTableModule,
    MatPaginatorModule
  ],
  templateUrl: './card-lost-damaged.component.html',
  styleUrls: ['../../../../table.css']
})
export class CardLostDamagedComponent implements OnInit {

  reportForm: FormGroup;
 allData: any[] = [];
  filteredData: any[] = [];
  displayedData: any[] = [];
  pageSizes = [10, 20, 50, 100, 150, 200];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
mockData: any[] = [
  { id: 'ID001', ownerName: 'John Doe', ownerId: 'CSN001', cardType: 'Resident', cardEncodedOn: new Date('2026-01-01T10:00:00'), cardPrintedOn: new Date('2026-01-01T11:00:00') , status: 'Lost' },
  { id: 'ID002', ownerName: 'Jane Smith', ownerId: 'CSN002', cardType: 'Tenant', cardEncodedOn: new Date('2026-01-02T10:30:00'), cardPrintedOn: new Date('2026-01-02T11:15:00'), status: 'Damaged' },
  { id: 'ID003', ownerName: 'Alice Johnson', ownerId: 'CSN003', cardType: 'Service provider', cardEncodedOn: new Date('2026-01-03T09:45:00'), cardPrintedOn: new Date('2026-01-03T10:30:00'), status: 'Lost' },
  { id: 'ID004', ownerName: 'Bob Brown', ownerId: 'CSN004', cardType: 'Contractor Employee', cardEncodedOn: new Date('2026-01-04T10:00:00'), cardPrintedOn: new Date('2026-01-04T10:45:00'), status: 'Damaged' },
  { id: 'ID005', ownerName: 'Charlie Davis', ownerId: 'CSN005', cardType: 'Nanded Employee', cardEncodedOn: new Date('2026-01-05T11:00:00'), cardPrintedOn: new Date('2026-01-05T11:30:00'), status: 'Lost' },
  { id: 'ID006', ownerName: 'Eva Green', ownerId: 'CSN006', cardType: 'Land Owner', cardEncodedOn: new Date('2026-01-06T09:30:00'), cardPrintedOn: new Date('2026-01-06T10:15:00'), status: 'Damaged' },
  { id: 'ID007', ownerName: 'Frank Hall', ownerId: 'CSN007', cardType: 'Guest', cardEncodedOn: new Date('2026-01-07T10:10:00'), cardPrintedOn: new Date('2026-01-07T10:50:00'), status: 'Lost' },
  { id: 'ID008', ownerName: 'Grace Lee', ownerId: 'CSN008', cardType: 'Resident', cardEncodedOn: new Date('2026-01-08T11:20:00'), cardPrintedOn: new Date('2026-01-08T12:00:00'), status: 'Damaged' },
  { id: 'ID009', ownerName: 'Henry Moore', ownerId: 'CSN009', cardType: 'Tenant', cardEncodedOn: new Date('2026-01-09T09:50:00'), cardPrintedOn: new Date('2026-01-09T10:40:00'), status: 'Lost' },
  { id: 'ID010', ownerName: 'Ivy Nelson', ownerId: 'CSN010', cardType: 'Service provider', cardEncodedOn: new Date('2026-01-10T10:05:00'), cardPrintedOn: new Date('2026-01-10T10:55:00'), status: 'Damaged' },
  { id: 'ID011', ownerName: 'Jack Owen', ownerId: 'CSN011', cardType: 'Contractor Employee', cardEncodedOn: new Date('2026-01-11T09:15:00'), cardPrintedOn: new Date('2026-01-11T10:05:00'), status: 'Lost' },
  { id: 'ID012', ownerName: 'Kara Patel', ownerId: 'CSN012', cardType: 'Nanded Employee', cardEncodedOn: new Date('2026-01-12T10:20:00'), cardPrintedOn: new Date('2026-01-12T11:00:00'), status: 'Damaged' },
  { id: 'ID013', ownerName: 'Leo Quinn', ownerId: 'CSN013', cardType: 'Land Owner', cardEncodedOn: new Date('2026-01-13T09:40:00'), cardPrintedOn: new Date('2026-01-13T10:20:00'), status: 'Lost' },
  { id: 'ID014', ownerName: 'Mia Roberts', ownerId: 'CSN014', cardType: 'Guest', cardEncodedOn: new Date('2026-01-14T10:50:00'), cardPrintedOn: new Date('2026-01-14T11:30:00'), status: 'Damaged' },
  { id: 'ID015', ownerName: 'Noah Scott', ownerId: 'CSN015', cardType: 'Resident', cardEncodedOn: new Date('2026-01-15T11:10:00'), cardPrintedOn: new Date('2026-01-15T11:50:00'), status: 'Lost' }
];

  displayColumns: string[] = ['id', 'cardType', 'ownerName', 'ownerId', 'cardEncodedOn', 'cardPrintedOn', 'dateTime'];

  cardTypes = [
    { value: 'Resident', label: 'Resident' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'Service provider', label: 'Service provider' },
    { value: 'Contractor Employee', label: 'Contractor Employee' },
    { value: 'Nanded Employee', label: 'Nanded Employee' },
    { value: 'Land Owner', label: 'Land Owner' },
    { value: 'Guest', label: 'Guest' }
  ];

  searchOptions = [
  { value: 'ownerName', label: 'Short Name' },
  { value: 'id', label: 'ID Number' },
  { value: 'ownerId', label: 'CSN' }
];


  constructor(private fb: FormBuilder, private http: HttpClient, private sortService: TableSortService) {
    let today=new Date();
    this.reportForm = this.fb.group({
      liableType: ['lost'],
       cardType: [''],
      fromDate: [today],
      toDate: [today],
      searchBy: [''],  
  searchText: ['']
    });
  }

  ngOnInit() {
      // this.loadAllCardData();
      this.allData = this.mockData;
    }
  
    private loadAllCardData(): void {
      this.http.get<any[]>(`${environment.apiurl}Report/Cardlostdamage`).subscribe({
        next: data => {
          this.allData = data;
          this.filteredData = [];
          this.displayedData = [];
        },
        error: err => {
          console.error('Failed to load card printing data:', err);
          this.allData = [];
          this.filteredData = [];
          this.displayedData = [];
        }
      });
    }
  
   onCardTypeChange(event: any) {
  const selected = event.value;

  if (selected.includes('all')) {
    // Select all card types if 'All' is clicked
    this.reportForm.get('cardType')?.setValue(
      this.cardTypes.map(ct => ct.value),
      { emitEvent: false }
    );
  } else {
    this.reportForm.get('cardType')?.setValue(selected, { emitEvent: false });
  }
}

  
  
  applyFilters(): void {
  const { fromDate, toDate, cardType, liableType } = this.reportForm.value;
  let filtered = [...this.allData];

  // // 🔹 LIABLE TYPE FILTER (lost, damage, both)
  // if (liableType && liableType !== 'both') {
  //   filtered = filtered.filter(d => d.status?.toLowerCase() === liableType);
  // }

  // 🔹 SEARCH FILTER (by selected column)
const searchText = this.reportForm.value.searchText?.toLowerCase();
const searchBy = this.reportForm.value.searchBy;

if (searchText && searchBy) {
  filtered = filtered.filter(d => {
    const fieldValue = d[searchBy];
    return fieldValue?.toString().toLowerCase().startsWith(searchText);
  });
}

  // 🔹 LIABLE TYPE FILTER (lost, damage, both)
if (liableType && liableType !== 'both') {
  filtered = filtered.filter(d => {
    const status = d.status?.toLowerCase();
    if (liableType === 'lost') return status === 'lost';
    if (liableType === 'damage') return status === 'damaged'; // match spelling in mockData
    return true;
  });
}


  // 🔹 CARD TYPE FILTER
if (cardType && cardType.length > 0) {
  let types: string[] = [];
  if (cardType.includes('all')) {
    types = this.cardTypes.map(ct => ct.value); // all card types
  } else {
    types = cardType;
  }
  types = [...new Set(types)]; // remove duplicates
  filtered = filtered.filter(d => types.includes(d.cardType));
}


  // 🔹 DATE FILTER (using cardEncodedOn)
  if (fromDate) {
    const from = new Date(fromDate);
    from.setHours(0, 0, 0, 0);
    filtered = filtered.filter(d => {
      if (!d.cardEncodedOn) return false;
      const recordDate = new Date(d.cardEncodedOn);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate >= from;
    });
  }

  if (toDate) {
    const to = new Date(toDate);
    to.setHours(0, 0, 0, 0);
    filtered = filtered.filter(d => {
      if (!d.cardEncodedOn) return false;
      const recordDate = new Date(d.cardEncodedOn);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate <= to;
    });
  }

  // 🔹 UPDATE TABLE + PAGINATOR
  this.filteredData = filtered;
  this.paginator.length = this.filteredData.length;
  this.paginator.firstPage();
  this.updateDisplayedData(0, this.paginator.pageSize || this.pageSizes[0]);
}

  
    public sortColumn(column: string) {
      if (this.sortService.getSortColumn() === column) {
        this.sortService.toggleDirection();
      } else {
        this.sortService.setSortColumn(column, 'asc');
      }
      this.displayedData = this.sortService.sortData([...this.displayedData], column);
      if (this.paginator) this.paginator.firstPage();
    }
  
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
  
    // Compute min and max dates
    const dates = this.filteredData
      .map(d => d.cardPrintingDate ? new Date(d.cardPrintingDate) : null)
      .filter(d => d !== null) as Date[];
  
    const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;
  
    const dateRangeText = minDate && maxDate
      ? `Card LOST&DAMAGE Date From: ${minDate.toLocaleDateString()} - To: ${maxDate.toLocaleDateString()}`
      : '';
  
    logo.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
  
      // Logo + Title
      doc.addImage(logo, 'JPEG', 10, 10, 15, 15);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('CARD LOST&DAMAGE', pageWidth / 2, 20, { align: 'center' });
  
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
  i + 1,                                     // Sr No
  d.id || '',                                // ID Number
  d.ownerName || '',                          // Short Name
  d.ownerId || '',                            // Owner ID
  d.cardType || '',                           // Card Type
  d.cardEncodedOn ? new Date(d.cardEncodedOn).toLocaleString() : '', // Card Encoded On
  d.cardPrintedOn ? new Date(d.cardPrintedOn).toLocaleString() : '', // Card Printed On
  d.status || ''                              // Status
]);

autoTable(doc, {
  startY: 35,
  head: [['Sr No', 'ID Number', 'Short Name', 'Owner ID', 'Card Type', 'Card Encoded On', 'Card Printed On', 'Status']],
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
  
      doc.save('CardLostDamage.pdf');
    };
  }
  
  
    exportToExcel() {
      if (!this.filteredData.length) return;
  
      const printedDate = new Date().toLocaleString();
     const excelData = this.filteredData.map((d, i) => ({
  'Sr No': i + 1,
  'ID Number': d.id || '',                // was d.idNumber
  'Short Name': d.ownerName || '',        // was d.shortname
  'Owner ID': d.ownerId || '',            // was d.csn
  'Card Type': d.cardType || '',
  'Card Encoded On': d.cardEncodedOn ? DateTimeUtil.formatDateTime(d.cardEncodedOn) : '',  // was cardPrintingDate
  'Card Printed On': d.cardPrintedOn ? DateTimeUtil.formatDateTime(d.cardPrintedOn) : '',
  'Status': d.status || ''                // same
}));

  
      const wb = XLSX.utils.book_new();
      const wsData: any[][] = [
        ["CARD LOST&DAMAGE", "", "", "", "", "", "", "", "", `Printed On: ${printedDate}`],
        [],
        Object.keys(excelData[0])
      ];
  
      excelData.forEach(row => wsData.push(Object.values(row)));
      const ws = XLSX.utils.aoa_to_sheet(wsData);
  
      ws["A1"].s = { font: { bold: true, sz: 20 }, alignment: { horizontal: "center" } };
      const totalCols = Object.keys(excelData[0]).length;
      ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: totalCols - 2 } }];
  
      const printedCell = XLSX.utils.encode_cell({ r: 0, c: totalCols - 1 });
      ws[printedCell].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: "right" } };
  
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
  
      ws["!cols"] = headers.map(h => ({ wch: h.length + 15 }));
      XLSX.utils.book_append_sheet(wb, ws, "CardPrintingLogs");
      const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([buffer]), "CardPrintingLogs.xlsx");
    }
  }
