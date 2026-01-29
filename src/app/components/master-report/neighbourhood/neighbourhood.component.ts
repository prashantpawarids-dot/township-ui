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
  selector: 'app-neighbourhood',
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
  templateUrl: './neighbourhood.component.html',
  styleUrls: ['./neighbourhood.component.scss','../../../../table.css']
})
export class NeighbourhoodComponent implements AfterViewInit {
  @ViewChild('paginator') paginator!: MatPaginator;

  reportForm: FormGroup;
  neighbourhoodData: any[] = [];
  displayedData: any[] = [];
  pagedData: any[] = [];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      searchType: ['name'],
      searchText: ['']
    });
  }

ngOnInit() {
    this.loadNeighbourhoodData();

    // Auto-search/filter as user types
    this.reportForm.get('searchText')?.valueChanges.subscribe(() => this.applyFilters());
    this.reportForm.get('searchType')?.valueChanges.subscribe(() => this.applyFilters());
  }

  ngAfterViewInit() {
    this.updatePagedData();
  }

  loadNeighbourhoodData() {
    const apiUrl = `${environment.apiurl}NRD`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.neighbourhoodData = data.map(n => ({
            name: n.name || '',
            isActive: n.isactive
          }));
          
          this.displayedData = [];
        }
      },
      error: (err) => console.error('Error fetching Neighbourhood Data:', err)
    });
  }

  showReports() {
    this.applyFilters();
  }

  showAll() {
    this.reportForm.reset({ searchType: 'name', searchText: '' });
    this.displayedData = [...this.neighbourhoodData];
    this.paginator.firstPage();
    this.updatePagedData();
  }

  private applyFilters() {
  const { searchType, searchText } = this.reportForm.value;
  const txt = (searchText || '').trim().toLowerCase();

  // If search text is empty, do not show any records
  if (!txt) {
    this.displayedData = [];
    this.updatePagedData();
    return;
  }

  this.displayedData = this.neighbourhoodData.filter(n => {
    if (searchType === 'name') {
      return n.name.toLowerCase().startsWith(txt);
    } else if (searchType === 'status') {
      const statusText = n.isActive ? 'active' : 'inactive';
      return statusText.startsWith(txt);
    }
    return true;
  });

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
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    const end = start + this.paginator.pageSize;
    this.pagedData = this.displayedData.slice(start, end);
  }

  exportReports() {
    if (!this.displayedData.length) return;
    const doc = new jsPDF('l', 'mm', 'a4');
    const logo = new Image();
    logo.src = 'assets/images/logo/logo.jpeg';

    logo.onload = () => {
      doc.addImage(logo, 'JPEG', 10, 10, 15, 15);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.text('NEIGHBOURHOOD REPORT', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

      autoTable(doc, {
        startY: 45,
        head: [['SR NO', 'NEIGHBOURHOOD NAME', 'STATUS']],
        body: this.displayedData.map((n, i) => [i + 1, n.name, n.isActive ? 'Active' : 'Inactive']),
        theme: 'grid',
        headStyles: { fillColor: [220,220,220], textColor:0, halign: 'center', fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { halign: 'center', fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        didDrawPage: (data) => {
          const pageWidth = doc.internal.pageSize.getWidth();
          const pageHeight = doc.internal.pageSize.getHeight();
          const today = new Date();
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`printed on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, pageWidth - 10, 20, { align: 'right' });
          doc.text('© IDS ID SMART TECH', 10, pageHeight - 10);
          doc.text(`Page ${data.pageNumber}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
        }
      });

      doc.save('NeighbourhoodReport.pdf');
    };
  }

  exportExcel() {
    if (!this.displayedData.length) return;

    const printedDate = new Date().toLocaleString();
    const excelData = this.displayedData.map((n, i) => ({
      'SR NO': i + 1,
      'NEIGHBOURHOOD NAME': n.name,
      'STATUS': n.isActive ? 'Active' : 'Inactive'
    }));

    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [
      ["NEIGHBOURHOOD REPORT", "", "", `Printed: ${printedDate}`],
      [],
      Object.keys(excelData[0])
    ];
    excelData.forEach(row => wsData.push(Object.values(row)));
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["A1"].s = { font: { bold: true, sz: 18 }, alignment: { horizontal: "center" } };
    ws["!merges"] = ws["!merges"] || [];
    ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } });

    const printedCell = XLSX.utils.encode_cell({ r: 0, c: 3 });
    ws[printedCell].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: "right" } };

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

    ws["!cols"] = headers.map(h => ({ wch: h.length + 20 }));
    XLSX.utils.book_append_sheet(wb, ws, 'Neighbourhood Report');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array', cellStyles: true });
    saveAs(new Blob([buffer]), 'NeighbourhoodReport.xlsx');
  }
}
