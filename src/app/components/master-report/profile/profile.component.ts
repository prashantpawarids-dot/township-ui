import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from 'src/environments/environment.prod';

import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatPaginatorModule,
    HttpClientModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss','../../../../table.css']
})
export class ProfileComponent {

  reportForm: FormGroup;
  profileData: any[] = [];
  displayedData: any[] = [];

  // Pagination
  pageSize = 10;
  pageIndex = 0;
  pageSizes = [5, 10, 25, 50];

  // Search types
  searchType = [
    { value: 'profileName', label: 'Profile Name' },
    { value: 'isActive', label: 'Status' },
    { value: 'companyId', label: 'Company ID' },
    { value: 'createdOn', label: 'Created On' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      searchType: [''],
      searchText: ['']
    });
  }

  ngOnInit() {
    this.loadProfileData();
  }

  loadProfileData() {
    this.http.get<any[]>(`${environment.apiurl}Profile`).subscribe({
      next: (data) => {
        this.profileData = data.map(p => ({
          profileName: p.profileName || '',
          isActive: p.isActive,
          createdOn: p.createdOn,
          companyId: p.companyid
        }));
      },
      error: (err) => console.log(err)
    });
  }

  showReports() {
    this.applyFilters();
  }

  showAll() {
    this.reportForm.reset();
    this.displayedData = [...this.profileData];
  }

  applyFilters() {
    let filtered = [...this.profileData];
    const { searchType, searchText } = this.reportForm.value;

    if (searchType && searchText) {
      const txt = searchText.toLowerCase();

      filtered = filtered.filter(p =>
        p[searchType]?.toString().toLowerCase().includes(txt)
      );
    }

    this.displayedData = filtered;
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  // ---------------------------------------------------------
  // PDF EXPORT
  // ---------------------------------------------------------
 exportPDF() {
  const doc = new jsPDF('l', 'mm', 'a4');
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  logo.onload = () => {
    const pageWidth = doc.internal.pageSize.width;

    // Header
    doc.addImage(logo, 'JPEG', 10, 10, 25, 25);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PROFILE REPORT', pageWidth / 2, 20, { align: 'center' });

    autoTable(doc, {
      startY: 45,

      // ✅ STATUS moved to last column
      head: [['SR NO', 'PROFILE NAME', 'COMPANY ID', 'CREATED ON', 'STATUS']],
      body: this.displayedData.map((p, i) => [
        i + 1,
        p.profileName,
        p.companyId,
        p.createdOn,
        p.isActive ? 'Active' : 'Inactive'   // move here
      ]),

      theme: 'grid',
      headStyles: { fillColor: [220,220,220], textColor: 0, halign: 'center', fontStyle: 'bold' },
      bodyStyles: { halign: 'center' },
      alternateRowStyles: { fillColor: [245, 245, 245] },

      didDrawPage: (data) => {
        const pageHeight = doc.internal.pageSize.height;

        // Footer Left
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('© IDS ID', 10, pageHeight - 10);

        // Page number (from autoTable)
        const pageNumber = data.pageNumber;

        // Footer Right
        doc.text(`Page ${pageNumber}`, pageWidth - 10, pageHeight - 10, { align: 'right' });

        // Printed date top right
        const today = new Date();
        doc.text(
          `printed on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`,
          pageWidth - 10,
          20,
          { align: 'right' }
        );
      }
    });

    doc.save('ProfileReport.pdf');
  };
}




  // ---------------------------------------------------------
  // EXCEL EXPORT (Styled)
  // ---------------------------------------------------------
  exportExcel() {
    const printed = new Date().toLocaleString();

    const excelData = this.displayedData.map((p, i) => ({
      'SR NO': i + 1,
      'PROFILE NAME': p.profileName,
      'STATUS': p.isActive ? 'Active' : 'Inactive',
      'COMPANY ID': p.companyId,
      'CREATED ON': p.createdOn
    }));

    const wsData: any[][] = [
      ["PROFILE REPORT", "", "", "", `Printed: ${printed}`],
      [],
      Object.keys(excelData[0])
    ];

    excelData.forEach(row => wsData.push(Object.values(row)));

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge heading row
    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
    ];

    // Style heading
    ws["A1"].s = {
      font: { bold: true, sz: 18 },
      alignment: { horizontal: "center" }
    };

    // Style printed date
    ws["E1"].s = {
      font: { bold: true },
      alignment: { horizontal: "right" }
    };

    // Style headers
    const headers = Object.keys(excelData[0]);
    headers.forEach((_, i) => {
      const cell = XLSX.utils.encode_cell({ r: 2, c: i });

      ws[cell].s = {
        font: { bold: true },
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

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ProfileReport");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "ProfileReport.xlsx");
  }

}


