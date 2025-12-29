import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from 'src/environments/environment.prod';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-reader-relay',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    HttpClientModule
  ],
  templateUrl: './reader-relay.component.html',
  styleUrls: ['./reader-relay.component.scss','../../../../table.css']
})
export class ReaderRelayComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  reportForm: FormGroup;
  readerData: any[] = [];
  displayedData: any[] = [];
  pagedData: any[] = [];
  displayedColumns = ['srNo', 'readermode', 'readerLocation'];
  pageSizes = [5, 10, 25, 50];

  searchType = [
    { value: 'readermode', label: 'Reader Mode' },
    { value: 'readerLocation', label: 'Reader Location' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      searchType: [''],
      searchText: ['']
    });
  }

  ngOnInit() {
    this.loadReaderData();
    this.reportForm.get('searchText')?.valueChanges.subscribe(() => this.applyFilters());
    this.reportForm.get('searchType')?.valueChanges.subscribe(() => this.applyFilters());
  }

  ngAfterViewInit() {
    this.updatePagedData();
  }

  loadReaderData() {
    const apiUrl = `${environment.apiurl}Reader`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          this.readerData = data.map(r => ({
            readermode: r.readermode || '',
            readerLocation: r.readerLocation || ''
          }));
          this.displayedData = [...this.readerData];
          this.updatePagedData();
        } else {
          this.readerData = [];
        }
      },
      error: (err) => console.error('Error fetching Reader Data:', err)
    });
  }

  showReports() {
    this.applyFilters();
  }

  showAll() {
    this.reportForm.reset();
    this.displayedData = [...this.readerData];
    this.paginator.firstPage();
    this.updatePagedData();
  }

  private applyFilters() {
    let filtered = [...this.readerData];
    const { searchType, searchText } = this.reportForm.value;
    if (searchType && searchText) {
      const lowerText = searchText.toLowerCase();
      filtered = filtered.filter(r => r[searchType]?.toString().toLowerCase().includes(lowerText));
    }
    this.displayedData = filtered;
    this.paginator.firstPage();
    this.updatePagedData();
  }

  onPageChange(event?: PageEvent) {
    this.updatePagedData();
  }

  private updatePagedData() {
    if (!this.paginator) {
      this.pagedData = [...this.displayedData];
      return;
    }
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    this.pagedData = this.displayedData.slice(startIndex, endIndex);
  }

  exportReports() {
  const doc = new jsPDF('l', 'mm', 'a4');
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  logo.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const today = new Date();

    // Logo
    doc.addImage(logo, 'JPEG', 10, 10,15,15);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('READER RELAY REPORT', pageWidth / 2, 20, { align: 'center' });

    // Table
    autoTable(doc, {
      startY: 45,
      head: [['SR NO', 'READER MODE', 'READER LOCATION']],
      body: this.displayedData.map((r, i) => [i + 1, r.readermode, r.readerLocation]),
      theme: 'grid',
      headStyles: { fillColor: [220,220,220], textColor: 0, halign: 'center', fontStyle: 'bold', fontSize: 10 },
      bodyStyles: { halign: 'center', fontSize: 9, cellPadding: 3 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawPage: (data) => {
        // Generated date top-right
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`printed on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, pageWidth - 10, 20, { align: 'right' });

        // Footer
        doc.text('© IDS ID SMART TECH', 10, pageHeight - 10);
        doc.text(`Page ${data.pageNumber}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
      }
    });

    doc.save('ReaderRelayReport.pdf');
  };
}


  exportExcel() {
  if (!this.displayedData || this.displayedData.length === 0) return;

  const printedDate = new Date().toLocaleString();
  const excelData = this.displayedData.map((r, i) => ({
    'SR NO': i + 1,
    'READER MODE': r.readermode,
    'READER LOCATION': r.readerLocation
  }));

  const wb = XLSX.utils.book_new();

  // Row 1 => Title + Printed Date
  const wsData: any[][] = [
    ["READER RELAY REPORT", "", `Printed: ${printedDate}`],
    [],
    Object.keys(excelData[0])
  ];

  excelData.forEach(row => wsData.push(Object.values(row)));

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // STYLE: TITLE
  ws["A1"].s = { font: { bold: true, sz: 18 }, alignment: { horizontal: "center" } };
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } });

  // STYLE: Printed Date
  const printedCell = XLSX.utils.encode_cell({ r: 0, c: 2 });
  ws[printedCell].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: "right" } };

  // STYLE: Header row
  const headers = Object.keys(excelData[0]);
  headers.forEach((h, idx) => {
    const cell = XLSX.utils.encode_cell({ r: 2, c: idx });
    ws[cell].s = {
      font: { bold: true, sz: 12 },
      alignment: { horizontal: "center", vertical: "center" },
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
  ws["!cols"] = headers.map(h => ({ wch: h.length + 15 }));

  XLSX.utils.book_append_sheet(wb, ws, 'Reader Relay Report');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  saveAs(new Blob([buffer]), 'ReaderRelayReport.xlsx');
}

}
