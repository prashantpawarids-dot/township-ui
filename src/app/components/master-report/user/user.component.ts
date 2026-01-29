import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatTableModule,
    HttpClientModule
  ],
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss','../../../../table.css']
})
export class UserComponent {

  reportForm: FormGroup;
  userData: any[] = [];
  displayedData: any[] = [];

  searchType = [
    { value: 'uid', label: 'User ID' },
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' }
  ];

  // Pagination
  pageSizeOptions = [10, 25, 50, 100];
  pageSize = 10;
  currentPage = 1;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      searchType: ['name'],
      searchText: ['']
    });
  }

  ngOnInit() {
    this.loadUserData();

    // Auto-filter while typing or changing type
    this.reportForm.get('searchText')?.valueChanges.subscribe(() => this.autoFilter());
    this.reportForm.get('searchType')?.valueChanges.subscribe(() => this.autoFilter());
  }

  loadUserData() {
    const apiUrl = `${environment.apiurl}UserRegistration`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        this.userData = data.map(u => ({
          uid: u.uid || '',
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || ''
        }));
        // Only show headings on page load
        this.displayedData = [];
      },
      error: (err) => console.error(err)
    });
  }

  // Show filtered data on Search button
  showReports() {
    this.currentPage = 1;
    this.applyFilter();
  }

  // Show all data
  showAll() {
    this.reportForm.reset({ searchType: 'name', searchText: '' });
    this.displayedData = [...this.userData];
    this.currentPage = 1;
  }

  // Auto-filter while typing or changing search type
  private autoFilter() {
    const text = this.reportForm.value.searchText;
    if (text) this.applyFilter();
    else this.displayedData = [];
  }

  private applyFilter() {
    const { searchType, searchText } = this.reportForm.value;
    const txt = (searchText || '').toLowerCase();

    this.displayedData = this.userData.filter(u => 
      searchType && searchText ? u[searchType]?.toString().toLowerCase().includes(txt) : true
    );
    this.currentPage = 1;
  }

  // Pagination methods
  paginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.displayedData.slice(start, start + this.pageSize);
  }

  totalPages() {
    return Math.ceil(this.displayedData.length / this.pageSize);
  }

  totalPagesArray() {
    return Array.from({ length: this.totalPages() }, (_, i) => i + 1);
  }

  goToPage(page: number) { this.currentPage = page; }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages()) this.currentPage++; }
  onPageSizeChange(size: number) { this.pageSize = size; this.currentPage = 1; }

  exportReports() {
    const doc = new jsPDF('l', 'mm', 'a4');
    const logo = new Image();
    logo.src = 'assets/images/logo/logo.jpeg';

    logo.onload = () => {
      // Logo
      doc.addImage(logo, 'JPEG', 10, 10, 15, 15);

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('USER REPORT', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

      // Table
      autoTable(doc, {
        startY: 45,
        head: [['SR NO', 'USER ID', 'NAME', 'EMAIL', 'PHONE']],
        body: this.displayedData.map((u, i) => [i + 1, u.uid, u.name, u.email, u.phone]),
        theme: 'grid',
        headStyles: { fillColor: [220,220,220], textColor: 0, halign: 'center', fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { halign: 'center', fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didDrawPage: (data) => {
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const today = new Date();

          // Generated date top-right
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`Printed on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, pageWidth - 10, 20, { align: 'right' });

          // Footer
          doc.text('©IDS ID SMART TECH', 10, pageHeight - 10);
          doc.text(`Page ${data.pageNumber}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
        }
      });

      doc.save('UserReport.pdf');
    };
  }

  exportExcel() {
    if (!this.displayedData || this.displayedData.length === 0) return;

    const printedDate = new Date().toLocaleString();
    const excelData = this.displayedData.map((u, i) => ({
      'SR NO': i + 1,
      'USER ID': u.uid,
      'NAME': u.name,
      'EMAIL': u.email,
      'PHONE': u.phone
    }));

    const wb = XLSX.utils.book_new();

    // Row 1 => Title + Printed Date
    const wsData: any[][] = [
      ["USER REPORT", "", "", "", `Printed: ${printedDate}`],
      [],
      Object.keys(excelData[0])
    ];

    excelData.forEach(row => wsData.push(Object.values(row)));

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // STYLE: TITLE
    ws["A1"].s = { font: { bold: true, sz: 18 }, alignment: { horizontal: "center" } };
    ws["!merges"] = ws["!merges"] || [];
    ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } });

    // STYLE: Printed Date
    const printedCell = XLSX.utils.encode_cell({ r: 0, c: 4 });
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

    XLSX.utils.book_append_sheet(wb, ws, 'User Report');
    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
    saveAs(new Blob([buffer]), 'UserReport.xlsx');
  }
}
