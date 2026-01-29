import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as XLSX from 'xlsx-js-style';

import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-company-report',
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
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss','../../../../table.css']
})
export class CompanyComponent {

  reportForm: FormGroup;
  companyData: any[] = [];

  displayedData = new MatTableDataSource<any>([]);   // <-- Start empty
  pageSizes = [10, 25, 50];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchType = [
    { value: 'companyName', label: 'Company Name' },
    { value: 'companyCode', label: 'Company Code' },
    { value: 'city', label: 'City' },
    { value: 'contactPerson', label: 'Contact Person' },
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      searchType: ['companyName'],
      searchText: ['']
    });
  }

  ngOnInit() {
    this.loadCompanyData();
  }

  loadCompanyData() {
    const apiUrl = `${environment.apiurl}Company`;

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        this.companyData = data.map((c) => ({
          companyCode: c.comanyCode || '',
          companyName: c.companyName || '',
          city: c.city || '',
          address: c.address || '',
          contactPerson: c.contactPerson || '',
          contactNumber: c.mobileNo || '',
          isactive: c.isactive,
          createdby: c.createdby,
          createdon: c.createdon,
          projects: c.projects || null
        }));
      },
      error: (e) => console.error(e)
    });
  }

  // -----------------------------------------------------
  // 🔍 APPLY FILTERS
  // -----------------------------------------------------
  applyFilters() {
    const { searchType, searchText } = this.reportForm.value;

    let filtered = [...this.companyData];

    if (searchText) {
      filtered = filtered.filter((item) =>
        item[searchType]?.toString().toLowerCase().includes(searchText.toLowerCase())
      );
    }

    this.displayedData = new MatTableDataSource(filtered);
    this.displayedData.paginator = this.paginator;
  }

  showReports() {
    this.applyFilters();
  }

  showAll() {
    this.reportForm.reset({ searchType: 'companyName', searchText: '' });

    this.displayedData = new MatTableDataSource(this.companyData);
    this.displayedData.paginator = this.paginator;
  }

  // -----------------------------------------------------
  // 📄 EXPORT PDF (TOP 6 RECORDS ONLY)
  // -----------------------------------------------------
  exportReports() {
    if (this.displayedData.data.length === 0) return;

    const doc = new jsPDF('l', 'mm', 'a4');
    const logo = new Image();
    logo.src = 'assets/images/logo/logo.jpeg';
    const printDate = new Date().toLocaleString();

    const top6 = this.displayedData.data.slice(0, 6);

    logo.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.addImage(logo, 'JPEG', 10, 10, 15, 15);
      doc.setFont("helvetica", "bold"); 
      doc.setFontSize(18);
      doc.text('COMPANY REPORT', pageWidth / 2, 20, { align: 'center' });

      doc.setFontSize(10);
      doc.text(`Printed: ${printDate}`, pageWidth - 10, 20, { align: 'right' });

      autoTable(doc, {
        startY: 45,
        head: [['SR NO', 'COMPANY CODE', 'COMPANY NAME', 'CITY', 'ADDRESS', 'CONTACT PERSON', 'CONTACT NUMBER']],
        body: top6.map((c, i) => [
          i + 1,
          c.companyCode,
          c.companyName,
          c.city,
          c.address,
          c.contactPerson,
          c.contactNumber
        ]),
        theme: 'grid',
        headStyles: { fillColor: [220,220,220], textColor: 0, halign: 'center' },
        bodyStyles: { halign: 'center', fontSize: 9 },
        didDrawPage: (d) => {
          doc.setFontSize(10);
          doc.text('©IDS ID', 10, pageHeight - 10);
          doc.text(`Page 1`, pageWidth - 10, pageHeight - 10, { align: 'right' });
        }
      });

      doc.save('CompanyReport.pdf');
    };
  }

 exportExcel() {
  if (this.displayedData.data.length === 0) return;

  const printedDate = new Date().toLocaleString();

  const excelData = this.displayedData.data.map((c, i) => ({
  'SR NO': i + 1,
  'COMPANY CODE': c.companyCode,
  'COMPANY NAME': c.companyName,
  'CITY': c.city,
  'ADDRESS': c.address,
  'CONTACT PERSON': c.contactPerson,
  'CONTACT NUMBER': c.contactNumber,
  'Status': c.isactive ? 'Active' : 'Inactive',
  'Created On': c.createdon,
  'Projects': c.projects
}));


  const wb = XLSX.utils.book_new();

  // Row 1 => Heading + Printed Date
  const wsData: any[][] = [
    ["COMPANY REPORT", "", "", "", "", "", `Printed: ${printedDate}`],
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

  // Merge cells for centered heading (A1 to F1)
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: 5 }
  });

  // -------------------------------------------------------
  // STYLE: PRINTED DATE (Row 1, last column)
  // -------------------------------------------------------
  const printedCell = XLSX.utils.encode_cell({ r: 0, c: 6 });
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

  XLSX.utils.book_append_sheet(wb, ws, 'Company Report');

  const buffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array'
  });

  saveAs(new Blob([buffer]), 'CompanyReport.xlsx');
}


}
