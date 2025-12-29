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
  selector: 'app-service-type',
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
  templateUrl: './service-type.component.html',
  styleUrls: ['./service-type.component.scss', '../../../../table.css']
})
export class ServiceTypeComponent implements AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  reportForm: FormGroup;
  serviceTypeData: any[] = [];
  displayedData: any[] = []; // filtered data
  pagedData: any[] = [];     // data for current page
  displayedColumns = ['srNo', 'name'];
  pageSizes = [5, 10, 25, 50];

  searchType = [
    { value: 'name', label: 'Service Name' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      searchType: ['name'],
      searchText: ['']
    });
  }

  ngOnInit() {
    this.loadServiceTypeData();

    // Auto filter while typing (but only show results after "Show")
    this.reportForm.get('searchText')?.valueChanges.subscribe(() => this.autoFilter());
    this.reportForm.get('searchType')?.valueChanges.subscribe(() => this.autoFilter());
  }

  ngAfterViewInit() {
    this.updatePagedData();
  }

  loadServiceTypeData() {
    const apiUrl = `${environment.apiurl}ServiceType`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        this.serviceTypeData = data.map(s => ({ name: s.name || '' }));
        // Initially, show only headers
        this.displayedData = [];
        this.updatePagedData();
      },
      error: (err) => console.error('Error fetching Service Type Data:', err)
    });
  }

  /** Show filtered data when clicking "Show" */
  showReports() {
    this.applyFilters();
  }

  /** Show all data when clicking "All" */
  showAll() {
    this.reportForm.reset({ searchType: 'name', searchText: '' });
    this.displayedData = [...this.serviceTypeData];
    if (this.paginator) this.paginator.firstPage();
    this.updatePagedData();
  }

  private autoFilter() {
  const { searchType, searchText } = this.reportForm.value;
  const txt = (searchText || '').toLowerCase();

  if (txt) {
    // Filter data live
    this.displayedData = this.serviceTypeData.filter(s =>
      s[searchType]?.toString().toLowerCase().includes(txt)
    );
  } else {
    // If search box is empty, show all data
    this.displayedData = [...this.serviceTypeData];
  }

  if (this.paginator) this.paginator.firstPage();
  this.updatePagedData();
}

  private applyFilters() {
    const { searchType, searchText } = this.reportForm.value;
    const txt = (searchText || '').toLowerCase();
    this.displayedData = this.serviceTypeData.filter(s =>
      searchType && searchText ? s[searchType]?.toString().toLowerCase().includes(txt) : true
    );
    if (this.paginator) this.paginator.firstPage();
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
    doc.addImage(logo, 'JPEG', 10, 10, 15,15);

    // Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('SERVICE TYPE REPORT', pageWidth / 2, 20, { align: 'center' });

    // Table
    autoTable(doc, {
      startY: 45,
      head: [['SR NO', 'SERVICE NAME']],
      body: this.displayedData.map((s, i) => [i + 1, s.name]),
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

    doc.save('ServiceTypeReport.pdf');
  };
}
exportExcel() {
  if (!this.displayedData || this.displayedData.length === 0) return;

  const printedDate = new Date().toLocaleString();
  const excelData = this.displayedData.map((s, i) => ({
    'SR NO': i + 1,
    'SERVICE NAME': s.name
  }));

  const wb = XLSX.utils.book_new();

  // Row 1 => Title + Printed Date
  const wsData: any[][] = [
    ["SERVICE TYPE REPORT", "", `Printed: ${printedDate}`],
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

  XLSX.utils.book_append_sheet(wb, ws, 'Service Type Report');
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
  saveAs(new Blob([buffer]), 'ServiceTypeReport.xlsx');
}
}
