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
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-building',
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
  templateUrl: './building.component.html',
  styleUrls: ['./building.component.scss', '../../../../table.css']
})
export class BuildingComponent implements AfterViewInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  reportForm: FormGroup;
  buildingData: any[] = [];
  displayedData: any[] = [];
  pagedData: any[] = [];
  neighbourhoods: string[] = [];
  pageSizes = [5, 10, 25, 50,100,150,200];

  searchType = [
  { value: 'name', label: 'Building Name' },
  { value: 'code', label: 'Building Code' },
  { value: 'moduleType', label: 'Module Type' },
  { value: 'nrdName', label: 'Neighbourhood' }   // ← Added
];


  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      searchType: [''],
      searchText: [''],
      neighbourhood: [[]]  // multi-select
    });
  }

  ngOnInit() {
  this.loadBuildingData();

  this.reportForm.get('searchText')?.valueChanges.subscribe(() => this.applyFilters());
  this.reportForm.get('searchType')?.valueChanges.subscribe(() => this.applyFilters());
  this.reportForm.get('neighbourhood')?.valueChanges.subscribe(() => this.applyFilters());
}
ngAfterViewInit(): void {
  // Initialize paginator after view loads
  if (this.paginator) {
    this.paginator.firstPage();
  }
}


loadBuildingData() {
  const apiUrl = `${environment.apiurl}Building`;
  this.http.get<any[]>(apiUrl).subscribe({
    next: (data) => {
       console.log('API Response:', data);
      if (data && Array.isArray(data)) {
        this.buildingData = data.map(b => ({
          name: b.name || '',
          code: b.code || '',
          moduleType: b.moduleType || '',
          nrdName: b.nrdName || '',
          isActive: b.isactive,
          createdon: b.createdon,
          updatedon: b.updatedon
        }));

        // Unique neighbourhoods
        this.neighbourhoods = Array.from(new Set(this.buildingData.map(b => b.nrdName).filter(Boolean)));

        // Do NOT show any data initially
        this.displayedData = [];
        this.pagedData = [];
      }
    },
    error: (err) => console.error('Error fetching Building Data:', err)
  });
}

// Show filtered data
showReports() {
  this.applyFilters();
}

// Show all data
showAll() {
  this.reportForm.reset({ neighbourhood: ['all'] });
  this.displayedData = [...this.buildingData];
  if (this.paginator) this.paginator.firstPage();
  this.updatePagedData();
}

// Filter function remains the same
private applyFilters() {
  const { searchType, searchText, neighbourhood } = this.reportForm.value;
  let filtered = [...this.buildingData];

  if (searchType && searchText) {
    const lowerText = searchText.toLowerCase();
    filtered = filtered.filter(b =>
      b[searchType]?.toString().toLowerCase().includes(lowerText)
    );
  }

  if (neighbourhood && !neighbourhood.includes('all')) {
    filtered = filtered.filter(b => neighbourhood.includes(b.nrdName));
  }

  this.displayedData = filtered;
  if (this.paginator) this.paginator.firstPage();
  this.updatePagedData();
}


  onPageChange(event?: PageEvent) { this.updatePagedData(); }

  private updatePagedData() {
    if (!this.paginator) { this.pagedData = [...this.displayedData]; return; }
    const start = this.paginator.pageIndex * this.paginator.pageSize;
    const end = start + this.paginator.pageSize;
    this.pagedData = this.displayedData.slice(start, end);
  }

  exportReports() {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  logo.onload = () => {
    doc.addImage(logo, 'JPEG', 10, 10, 25, 25);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('BUILDING REPORT', doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });

    const today = new Date();
    autoTable(doc, {
  startY: 45,
  head: [['SR NO', 'BUILDING NAME', 'BUILDING CODE', 'MODULE TYPE', 'NEIGHBOURHOOD', 'IS ACTIVE', 'CREATED ON', 'UPDATED ON']],
  body: this.displayedData.map((b, i) => [
    i + 1,
    b.name,
    b.code,
    b.moduleType,
    b.nrdName,
    b.isactive ? 'Active' : 'Inactive',
    b.createdon,
    b.updatedon
  ]),
  theme: 'grid',
  headStyles: { fillColor: [220,220,220], textColor: 0, halign: 'center', fontStyle: 'bold', fontSize: 10 },
  bodyStyles: { halign: 'center', fontSize: 9 },
  alternateRowStyles: { fillColor: [245, 245, 245] },
  didDrawPage: (data) => {
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Heading already added before autoTable
    const today = new Date();
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    // Printed date top-right
    doc.text(`printed on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, pageWidth - 10, 20, { align: 'right' });

    // Copyright bottom-left
    doc.text('© IDS ID', 10, pageHeight - 10);

    // Page number bottom-right
    doc.text(`Page ${data.pageNumber}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
  }
});


    doc.save('BuildingReport.pdf');
  };
}


  exportExcel() {
  if (this.displayedData.length === 0) return;

  const printedDate = new Date().toLocaleString();

  const excelData = this.displayedData.map((b, i) => ({
    'SR NO': i + 1,
    'BUILDING NAME': b.name,
    'BUILDING CODE': b.code,
    'MODULE TYPE': b.moduleType,
    'NEIGHBOURHOOD': b.nrdName,
    'IS ACTIVE': b.isActive ? 'Active' : 'Inactive',
    'CREATED ON': new Date(b.createdon).toLocaleString(),
    'UPDATED ON': new Date(b.updatedon).toLocaleString()
  }));

  const wb = XLSX.utils.book_new();

  // Row 1 => Heading + Printed Date
  const wsData: any[][] = [
    ["BUILDING REPORT", "", "", "", "", "", "", `Printed: ${printedDate}`],
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

  // Merge cells for centered heading (A1 to G1)
  ws["!merges"] = ws["!merges"] || [];
  ws["!merges"].push({
    s: { r: 0, c: 0 },
    e: { r: 0, c: 6 }
  });

  // -------------------------------------------------------
  // STYLE: PRINTED DATE (Row 1, last column)
  // -------------------------------------------------------
  const printedCell = XLSX.utils.encode_cell({ r: 0, c: 7 });
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

  XLSX.utils.book_append_sheet(wb, ws, 'Building Report');

  const buffer = XLSX.write(wb, {
    bookType: 'xlsx',
    type: 'array'
  });

  saveAs(new Blob([buffer]), 'BuildingReport.xlsx');
}


}
