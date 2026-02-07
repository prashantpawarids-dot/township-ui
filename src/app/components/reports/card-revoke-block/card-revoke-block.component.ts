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
  selector: 'app-card-revoke-block',
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
  templateUrl: './card-revoke-block.component.html',
  styleUrls: ['../../../../table.css']
})
export class CardRevokeBlockComponent implements OnInit {

  reportForm: FormGroup;
  allData: any[] = [];
  filteredData: any[] = [];
  displayedData: any[] = [];
  pageSizes = [10, 20, 50, 100, 150, 200];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayColumns: string[] = ['iDnumber', 'csn', 'name', 'nrd', 'building', 'flatNumber', 'blockDate', 'revokeDate', 'durationMinutes'];

  searchOptions = [
    { value: 'iDnumber', label: 'ID Number' },
    { value: 'csn', label: 'CSN' },
    { value: 'name', label: 'Name' }
  ];

  dateFilterOptions = [
    { value: 'blockDate', label: 'Block Date' },
    { value: 'revokeDate', label: 'Revoke Date' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient, private sortService: TableSortService) {
    let today = new Date();
    this.reportForm = this.fb.group({
      dateFilterType: ['blockDate'],
      fromDate: [today],
      toDate: [today],
      searchBy: [''],
      searchText: ['']
    });
  }

  ngOnInit() {
    this.loadAllCardData();
  }

  private loadAllCardData(): void {
    this.http.get<any[]>(`${environment.apiurl}Report/CardAccessBlockInvokeRegister`).subscribe({
      next: data => {
        this.allData = data;
        this.filteredData = [];
        this.displayedData = [];
      },
      error: err => {
        console.error('Failed to load card block/revoke data:', err);
        this.allData = [];
        this.filteredData = [];
        this.displayedData = [];
      }
    });
  }

  applyFilters(): void {
    const { fromDate, toDate, dateFilterType } = this.reportForm.value;
    let filtered = [...this.allData];

    // 🔹 SEARCH FILTER (by selected column)
    const searchText = this.reportForm.value.searchText?.toLowerCase();
    const searchBy = this.reportForm.value.searchBy;

    if (searchText && searchBy) {
      filtered = filtered.filter(d => {
        const fieldValue = d[searchBy];
        return fieldValue?.toString().toLowerCase().startsWith(searchText);
      });
    }

    // 🔹 DATE FILTER (based on selected date type - blockDate or revokeDate)
    const dateField = dateFilterType || 'blockDate';

    if (fromDate) {
      const from = new Date(fromDate);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => {
        if (!d[dateField]) return false;
        const recordDate = new Date(d[dateField]);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate >= from;
      });
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(0, 0, 0, 0);
      filtered = filtered.filter(d => {
        if (!d[dateField]) return false;
        const recordDate = new Date(d[dateField]);
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
    this.reportForm.reset({ dateFilterType: 'blockDate' });
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

    // Compute min and max dates based on selected date filter
    const dateField = this.reportForm.value.dateFilterType || 'blockDate';
    const dates = this.filteredData
      .map(d => d[dateField] ? new Date(d[dateField]) : null)
      .filter(d => d !== null) as Date[];

    const minDate = dates.length ? new Date(Math.min(...dates.map(d => d.getTime()))) : null;
    const maxDate = dates.length ? new Date(Math.max(...dates.map(d => d.getTime()))) : null;

    const dateLabel = dateField === 'blockDate' ? 'Block Date' : 'Revoke Date';
    const dateRangeText = minDate && maxDate
      ? `${dateLabel} From: ${minDate.toLocaleDateString()} - To: ${maxDate.toLocaleDateString()}`
      : '';

    logo.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Logo + Title
      doc.addImage(logo, 'JPEG', 10, 10, 15, 15);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('CARD BLOCK & REVOKE REGISTER', pageWidth / 2, 20, { align: 'center' });

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
        d.iDnumber || '',
        d.csn || '',
        d.name || '',
        d.nrd || '',
        d.building || '',
        d.flatNumber || '',
        d.blockDate ? new Date(d.blockDate).toLocaleString() : '',
        d.revokeDate ? new Date(d.revokeDate).toLocaleString() : '',
        d.durationMinutes || '0'
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Sr No', 'ID Number', 'CSN', 'Name', 'NRD', 'Building', 'Flat Number', 'Block Date', 'Revoke Date', 'Duration (min)']],
        body,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
        bodyStyles: {
          fontSize: 8,
          textColor: [0, 0, 0],
          fontStyle: 'normal'
        },
        didDrawPage: (data) => {
          doc.setFontSize(10);
          doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          doc.text('©IDS ID SMART TECH', 10, pageHeight - 10);
        }
      });

      doc.save('CardBlockRevoke.pdf');
    };
  }

  exportToExcel() {
    if (!this.filteredData.length) return;

    const printedDate = new Date().toLocaleString();
    const excelData = this.filteredData.map((d, i) => ({
      'Sr No': i + 1,
      'ID Number': d.iDnumber || '',
      'CSN': d.csn || '',
      'Name': d.name || '',
      'NRD': d.nrd || '',
      'Building': d.building || '',
      'Flat Number': d.flatNumber || '',
      'Block Date': d.blockDate ? DateTimeUtil.formatDateTime(d.blockDate) : '',
      'Revoke Date': d.revokeDate ? DateTimeUtil.formatDateTime(d.revokeDate) : '',
      'Duration (min)': d.durationMinutes || '0'
    }));

    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [
      ["CARD BLOCK & REVOKE REGISTER", "", "", "", "", "", "", "", "", `Printed On: ${printedDate}`],
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
    XLSX.utils.book_append_sheet(wb, ws, "CardBlockRevoke");
    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "CardBlockRevoke.xlsx");
  }
}