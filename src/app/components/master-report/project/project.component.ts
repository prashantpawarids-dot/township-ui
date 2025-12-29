import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from 'src/environments/environment.prod';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-project',
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
  templateUrl: './project.component.html',
 styleUrls: [
    './project.component.scss',
    '../../../../table.css'
  ]
})
export class ProjectComponent {

  reportForm: FormGroup;
  projectData: any[] = [];
  displayedData: any[] = [];
  displayedColumns = ['srNo', 'projectCode', 'projectName'];

  pageSize = 10;
  pageIndex = 0;
  pageSizes = [5, 10, 25, 50];

  searchType = [
    { value: 'projectCode', label: 'Project Code' },
    { value: 'projectName', label: 'Project Name' }
  ];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      searchType: [''],
      searchText: ['']
    });
  }

  ngOnInit() {
    this.loadProjectData();

    this.reportForm.get('searchText')?.valueChanges.subscribe(() => this.applyFilters());
    this.reportForm.get('searchType')?.valueChanges.subscribe(() => this.applyFilters());
  }

  loadProjectData() {
    const apiUrl = `${environment.apiurl}Project`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {
        if (data && Array.isArray(data)) {
          this.projectData = data.map((p: any) => ({
            projectCode: p.projectCode || '',
            projectName: p.projectName || ''
          }));
          this.displayedData = [...this.projectData];
        } else {
          this.projectData = [];
        }
      },
      error: (err) => console.error('Error fetching Project Data:', err)
    });
  }

  showReports() {
    this.applyFilters();
  }

  showAll() {
    this.reportForm.reset();
    this.displayedData = [...this.projectData];
  }

  private applyFilters() {
    let filtered = [...this.projectData];
    const { searchType, searchText } = this.reportForm.value;

    if (searchType && searchText) {
      const lowerText = searchText.toLowerCase();
      filtered = filtered.filter(p =>
        p[searchType]?.toString().toLowerCase().includes(lowerText)
      );
    }

    this.displayedData = filtered;
  }

  onPageChange(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
  }

  exportReports() {
    const doc = new jsPDF('l', 'mm', 'a4');
    const logo = new Image();
    logo.src = 'assets/images/logo/logo.jpeg';
    logo.onload = () => {
      doc.addImage(logo, 'JPEG', 10, 10, 25, 25);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('PROJECT REPORT', 150, 20, { align: 'center' });

      autoTable(doc, {
        startY: 45,
        head: [['SR NO', 'PROJECT CODE', 'PROJECT NAME']],
        body: this.displayedData.map((p, i) => [i + 1, p.projectCode, p.projectName]),
        theme: 'grid',
        headStyles: { fillColor: [220,220,220], textColor:0, halign: 'center', fontStyle: 'bold', fontSize: 10 },
        bodyStyles: { halign: 'center', fontSize: 9, cellPadding: 3 },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        styles: { font: 'helvetica', overflow: 'ellipsize' }
      });

      const today = new Date();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`printed on: ${today.toLocaleDateString()} ${today.toLocaleTimeString()}`, pageWidth - 10, pageHeight - 10, { align: 'right' });

      doc.save('ProjectReport.pdf');
    };
  }

  exportExcel() {
    const excelData = this.displayedData.map((p, i) => ({
      'SR NO': i + 1,
      'PROJECT CODE': p.projectCode,
      'PROJECT NAME': p.projectName
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ProjectReport');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'ProjectReport.xlsx');
  }
}
