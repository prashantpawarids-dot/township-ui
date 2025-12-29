import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { environment } from 'src/environments/environment';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
@Component({
  selector: 'app-tag-lost-damage',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule
  ],
  templateUrl: './tag-lost-damage.component.html',
  styleUrls: ['../../../../table.css']
})
export class TagLostDamageComponent implements OnInit, AfterViewInit {

  reportForm: FormGroup;
  displayedData = new MatTableDataSource<any>([]);
  allData: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  displayColumns: string[] = ['id', 'tagNo', 'ownerName', 'cardType', 'liableType', 'status', 'dateTime'];

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.reportForm = this.fb.group({
      fromDate: [''],
      toDate: [''],
      searchBy: ['id'],
      searchText: [''],
      liableType: ['both']
    });
  }

  ngOnInit() {
    this.loadData();
  }

  ngAfterViewInit() {
    this.displayedData.paginator = this.paginator;
  }

  loadData() {
    this.http.get<any[]>(`${environment.apiurl}Tag/GetLostDamageLog`).subscribe({
      next: (data) => {
        this.allData = data;
        this.displayedData.data = [...this.allData];
      },
      error: (err) => console.error('Error fetching tag lost/damage data:', err)
    });
  }

  filterData() {
    const { fromDate, toDate, searchBy, searchText, liableType } = this.reportForm.value;
    let filtered = [...this.allData];

    if (fromDate) {
      const from = new Date(fromDate).setHours(0,0,0,0);
      filtered = filtered.filter(d => d.dateTime && new Date(d.dateTime).getTime() >= from);
    }
    if (toDate) {
      const to = new Date(toDate).setHours(23,59,59,999);
      filtered = filtered.filter(d => d.dateTime && new Date(d.dateTime).getTime() <= to);
    }
    if (searchText) {
      filtered = filtered.filter(d => d[searchBy]?.toString().toLowerCase().includes(searchText.toLowerCase()));
    }
    if (liableType && liableType !== 'both') {
      filtered = filtered.filter(d => d.liableType === liableType);
    }

    this.displayedData.data = filtered;
  }

  showAll() {
    this.reportForm.reset({ searchBy: 'id', liableType: 'both' });
    this.displayedData.data = [...this.allData];
  }

  exportPDF() {
    if (!this.displayedData.data || this.displayedData.data.length === 0) return;

    const doc = new jsPDF();
    const logo = new Image();
    logo.src = 'assets/images/logo/logo.jpeg';

    logo.onload = () => {
      doc.addImage(logo, 'JPEG', 10, 10, 25, 25);
      doc.setFontSize(18);
      doc.text('Tag Lost/Damage Report', 105, 20, { align: 'center' });

      const { fromDate, toDate } = this.reportForm.value;
      if (fromDate || toDate) {
        let rangeText = 'Date Range: ';
        if (fromDate) rangeText += `From ${new Date(fromDate).toLocaleDateString()} `;
        if (toDate) rangeText += `To ${new Date(toDate).toLocaleDateString()}`;
        doc.setFontSize(10);
        doc.text(rangeText, 105, 30, { align: 'center' });
      }

      autoTable(doc, {
        startY: 40,
        head: [['ID', 'Tag No', 'Owner Name', 'Card Type', 'Liable Type', 'Status', 'DateTime']],
        body: this.displayedData.data.map(t => [
          t.id,
          t.tagNo || '',
          t.ownerName || '',
          t.cardType || '',
          t.liableType || '',
          t.status || '',
          t.dateTime ? new Date(t.dateTime).toLocaleString() : ''
        ]),
        theme: 'grid',
        headStyles: { fillColor: [41,128,185], textColor: 255, halign:'center', fontStyle:'bold', fontSize:9 },
        bodyStyles: { halign:'center', fontSize:8 },
        styles: { font:'helvetica', overflow:'linebreak', cellPadding:2 }
      });

      doc.save('TagLostDamageReport.pdf');
    };
  }
exportExcel() {
  if (!this.displayedData.data || this.displayedData.data.length === 0) return;

  const excelData = this.displayedData.data.map((t, index) => ({
    'ID': t.id,
    'Tag No': t.tagNo || '',
    'Owner Name': t.ownerName || '',
    'Card Type': t.cardType || '',
    'Liable Type': t.liableType || '',
    'Status': t.status || '',
    'DateTime': t.dateTime ? new Date(t.dateTime).toLocaleString('en-GB') : ''
  }));

  const ws = XLSX.utils.json_to_sheet(excelData);
  const wb = XLSX.utils.book_new();

  // Sheet name must not contain invalid characters
  XLSX.utils.book_append_sheet(wb, ws, 'Tag Lost Damage');

  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(new Blob([buffer]), 'TagLostDamageReport.xlsx');
}

}
