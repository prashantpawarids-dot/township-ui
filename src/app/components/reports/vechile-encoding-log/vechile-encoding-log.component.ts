import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { environment } from 'src/environments/environment';
import { sortByTimeOnly } from 'src/app/_core/shared/utils/sort.util';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import { DateTimeUtil } from 'src/app/_core/shared/utils/datetime.util';
@Component({
  selector: 'app-vechile-encoding-log',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './vechile-encoding-log.component.html',
  styleUrls: ['../../../../table.css']
})
export class VechileEncodingLogComponent implements OnInit, AfterViewInit {

  reportForm: FormGroup;
  allData: any[] = [];
  filteredData: any[] = [];

  pageIndex = 0;
  pageSize = 10;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private fb: FormBuilder, private http: HttpClient,private sortService: TableSortService) {
    this.reportForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      searchBy: [''],
      searchText: ['']
    });
  }

  ngOnInit() {
    this.loadData(); // Fetch real API data on component load
  }

  ngAfterViewInit() {
    // paginator exists
  }

  // ------------------- Load API Data -------------------
  loadData() {
  this.http.get<any[]>(`${environment.apiurl}Report/vehicleinoutreport`).subscribe({
    next: (res: any[]) => {
      // Map the API response to your table structure
      this.allData = res.map((item, i) => ({
        id: item.id,
        vehicleNo: item.vehicleNo,
        ownerName: item.ownerName,
        vehicleType: item.vehicleType,
        encodedBy: item.encodedBy,
        encodedOn: item.encodedOn,
        status: item.status
      }));

      this.filterData(); // Apply filters if any
    },
    error: (err) => {
      console.error('Error fetching vehicle logs', err);
    }
  });
}


  // ------------------- Filter Data -------------------
  filterData() {
    const { fromDate, toDate, searchBy, searchText } = this.reportForm.value;
    let filtered = [...this.allData];
if (fromDate) {
  // Start of the day for fromDate
  const from = new Date(fromDate).setHours(0, 0, 0, 0);
  filtered = filtered.filter(d => new Date(d.encodedOn).getTime() >= from);
}

if (toDate) {
  // End of the day for toDate
  const to = new Date(toDate).setHours(23, 59, 59, 999);
  filtered = filtered.filter(d => new Date(d.encodedOn).getTime() <= to);
}
   // SEARCH (must select search type + startsWith)
if (searchText && searchText.toString().trim() !== '') {

  if (!searchBy) {
    alert('Please select a search type');
    this.filteredData = [];
    return;
  }

  const searchValue = searchText.toString().toLowerCase();
  filtered = filtered.filter(d =>
    d[searchBy]?.toString().toLowerCase().startsWith(searchValue)
  );
}


    this.filteredData = filtered;
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
  }

  // ------------------- Clear Filters -------------------
  Clear() {
    this.reportForm.reset({ searchBy: '' });
    this.filteredData = [...this.allData];
    this.pageIndex = 0;
    if (this.paginator) this.paginator.firstPage();
  }

  // ------------------- Pagination -------------------
  getPagedData() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

 public sortColumn(column: string) {
  // Check if the clicked column is the same as the last sorted column
  if (this.sortService.getSortColumn() === column) {
    // Same column clicked: toggle the sorting direction
    this.sortService.toggleDirection();
  } else {
    // New column clicked: default to ascending sort
    this.sortService.setSortColumn(column, 'asc');
  }

  // Apply sorting to filteredData (clone it to avoid mutating original array)
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


  // ------------------- PDF Export -------------------
  exportPDF() {
   
    if (!this.filteredData || this.filteredData.length === 0) return;

    const generated = new Date().toLocaleString();
    const doc = new jsPDF('l', 'mm', 'a4');
    const logo = new Image();
    logo.src = 'assets/images/logo/logo.jpeg';

    logo.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // Logo
      doc.addImage(logo, 'JPEG', 10, 10, 15, 15);

      // Title
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('VEHICLE ENCODING LOG', pageWidth / 2, 20, { align: 'center' });

      // Date range from current page
      const dates = this.filteredData
        .map(r => r.encodedOn ? new Date(r.encodedOn) : null)
        .filter(d => d);
      if (dates.length) {
        const min = new Date(Math.min(...dates.map(d => d!.getTime())));
        const max = new Date(Math.max(...dates.map(d => d!.getTime())));
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`From: ${min.toLocaleDateString()} To: ${max.toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
      }

      // Print date
      doc.setFontSize(10);
      doc.text(`Printed On: ${generated}`, pageWidth - 10, 20, { align: 'right' });

      // Table body
      const body = this.filteredData.map((r, i) => [
        i + 1,
        r.id,
        r.vehicleNo || 'N/A',
        r.ownerName || 'N/A',
        r.vehicleType || 'N/A',
        r.encodedBy || 'N/A',
        r.encodedOn ? new Date(r.encodedOn).toLocaleString() : 'N/A',
        r.status || 'N/A'
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Sr No', 'ID', 'Vehicle No', 'Owner Name', 'Vehicle Type', 'Encoded By', 'Encoded On', 'Status']],
        body,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: 20, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, textColor: [0,0,0], fontStyle: 'normal' },
        didDrawPage: (data) => {
          doc.setFontSize(10);
          doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          doc.text('©IDS ID SMART TECH', 10, pageHeight - 10);
        }
      });

      doc.save('VehicleEncodingLog.pdf');
    };
  }

  // ------------------- Excel Export -------------------
  exportExcel() {
    
    if (!this.filteredData || this.filteredData.length === 0) return;

    const printedDate = new Date().toLocaleString();

    const excelData = this.filteredData.map((r, i) => ({
      'Sr No': i + 1,
      'ID': r.id,
      'Vehicle No': r.vehicleNo || '',
      'Owner Name': r.ownerName || '',
      'Vehicle Type': r.vehicleType || '',
      'Encoded By': r.encodedBy || '',
     'Encoded On': r.encodedOn ? DateTimeUtil.formatDateTime(r.encodedOn) : '',
     'Status': r.status || ''
    }));

    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [
      ["VEHICLE ENCODING LOG", "", "", "", "", "", "", "", `Printed: ${printedDate}`],
      [],
      Object.keys(excelData[0])
    ];

    excelData.forEach(row => wsData.push(Object.values(row)));

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    ws["A1"].s = { font: { bold: true, sz: 20 }, alignment: { horizontal: "center" } };
    const totalColumns = Object.keys(excelData[0]).length;
    ws["!merges"] = ws["!merges"] || [];
    ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 2 } });

    const printedCell = XLSX.utils.encode_cell({ r: 0, c: totalColumns - 1 });
    ws[printedCell].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: "right" } };

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

    ws["!cols"] = headers.map(h => ({ wch: h.length + 15 }));

    XLSX.utils.book_append_sheet(wb, ws, "VehicleEncodingLog");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "VehicleEncodingLog.xlsx");
  }
}
