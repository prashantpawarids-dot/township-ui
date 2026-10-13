import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoaderService } from 'src/app/_core/shared/utils/loader.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
   selector: 'app-card-summary',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule
  ],
  templateUrl: './card-summary.component.html',
  styleUrls: ['./card-summary.component.scss','../../../../table.css']
})
export class CardSummaryComponent implements OnInit, AfterViewInit {

  reportForm: FormGroup;
  pagedData: any[] = [];
  totalCount = 0;
  pageIndex = 0;
  pageSize = 10;
  summary = { total: 0, issued: 0, notIssued: 0, blocked: 0 };

  nrdOptions: string[] = [];
  buildingOptions: string[] = [];
  cardTypeOptions: string[] = [];

  statusOptions = [
    { value: 'ALL',        label: 'All' },
    { value: 'ISSUED',     label: 'Card Issued' },
    { value: 'NOT_ISSUED', label: 'Not Issued' },
    { value: 'BLOCKED',    label: 'Blocked' }
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Last Search ke filters: export aur paging inhi par chalte hain
  private cur = { status: 'ALL', nrd: 'ALL', building: 'ALL', cardType: 'ALL', search: '' };

  private cardTypeLabels: Record<string, string> = {
    PResident: 'Resident',          DResident: 'Resident (Dependent)',
    PTenant: 'Tenant',              DTenant: 'Tenant (Dependent)',
    PLandOwner: 'Landowner',        DLandOwner: 'Landowner (Dependent)',
    Contractor: 'Contractor',       DContractor: 'Contractor (Dependent)',
    SProvider: 'Service Provider',  Employee: 'Employee',
    Guest: 'Guest',                 Visitor: 'Visitor'
  };

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private loaderService: LoaderService
  ) {
    this.reportForm = this.fb.group({
      status:      ['ALL'],
      nrd:         ['ALL'],
      building:    ['ALL'],
      cardType:    ['ALL'],
      searchValue: ['']
    });
  }

  ngOnInit() {
    this.loadFilters('', true);
  }

  ngAfterViewInit() {
    setTimeout(() => this.showReports());   // page khulte hi saara data
  }

  // ── Filters ───────────────────────────────────────────────
  private loadFilters(nrd: string, first = false) {
    this.authService.getCardSummaryFilters(nrd).subscribe({
      next: (res) => {
        if (first) {
          this.nrdOptions      = res?.nrds ?? [];
          this.cardTypeOptions = res?.cardTypes ?? [];
        }
        this.buildingOptions = res?.buildings ?? [];
      },
      error: () => { /* lists khali reh jayengi */ }
    });
  }

  onNrdChange() {
    const nrd = this.reportForm.value.nrd;
    this.reportForm.patchValue({ building: 'ALL' });
    this.loadFilters(nrd === 'ALL' ? '' : nrd);
  }

    get cur_status(): string { return this.cur.status; }

  getCardTypeLabel(t: string): string {
    return this.cardTypeLabels[t] || t || '—';
  }

  getStatusClass(s: string): string {
    if (s === 'Issued') return 'st-badge--issued';
    if (s === 'Blocked') return 'st-badge--blocked';
    return 'st-badge--not';
  }

  // ── Search / Clear ────────────────────────────────────────
  setStatus(value: string) {
    this.reportForm.patchValue({ status: value });
    this.showReports();
  }

  showReports() {
    const f = this.reportForm.value;
    this.cur = {
      status:   f.status   || 'ALL',
      nrd:      f.nrd      || 'ALL',
      building: f.building || 'ALL',
      cardType: f.cardType || 'ALL',
      search:   (f.searchValue || '').trim()
    };
    this.pageIndex = 0;
    this.load();
  }

  clearAll() {
    this.reportForm.reset({
      status: 'ALL', nrd: 'ALL', building: 'ALL', cardType: 'ALL', searchValue: ''
    });
    this.loadFilters('');
    this.showReports();
  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize  = event.pageSize;
    this.load();
  }

  private params(pageNumber: number, pageSize: number) {
    return { ...this.cur, pageNumber, pageSize };
  }

  private load() {
    this.loaderService.show();
    this.authService.getCardSummaryReport(this.params(this.pageIndex + 1, this.pageSize)).subscribe({
      next: (res) => {
        this.pagedData  = res?.data ?? [];
        this.totalCount = res?.totalCount ?? 0;
        this.summary    = res?.summary ?? { total: 0, issued: 0, notIssued: 0, blocked: 0 };
        this.loaderService.hide();
      },
      error: (err) => {
        console.error('Card summary load error:', err);
        this.loaderService.hide();
      }
    });
  }

  // ── Export: saara filtered data (page nahi) ───────────────
  private fetchExportData(callback: (data: any[]) => void) {
    this.loaderService.show();
    this.authService.getCardSummaryReport(this.params(1, 1000000)).subscribe({
      next: (res) => {
        this.loaderService.hide();
        callback(res?.data ?? []);
      },
      error: (err) => {
        console.error('Export fetch error:', err);
        this.loaderService.hide();
      }
    });
  }

  private getFilterText(): string {
    const st = this.statusOptions.find(s => s.value === this.cur.status)?.label || 'All';
    const nrd = this.cur.nrd === 'ALL' ? 'All' : this.cur.nrd;
    const bld = this.cur.building === 'ALL' ? 'All' : this.cur.building;
    return `Status: ${st}   |   NRD: ${nrd}   |   Building: ${bld}`;
  }

  exportPDF() {
    this.fetchExportData((data) => {
      if (!data.length) return;

      const logo = new Image();
      logo.onload  = () => this.buildPdf(data, logo);
      logo.onerror = () => this.buildPdf(data, null);
      logo.src = 'assets/images/logo/logo.jpeg';
    });
  }

  private buildPdf(data: any[], logo: HTMLImageElement | null) {
    const doc        = new jsPDF('l', 'mm', 'a4');
    const pageWidth  = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    if (logo) doc.addImage(logo, 'JPEG', 10, 10, 25, 25);

    const now = new Date();
    doc.setFontSize(9);
    doc.text(`Printed On: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
      pageWidth - 10, 20, { align: 'right' });

    doc.setFontSize(18);
    doc.setFont(undefined as any, 'bold');
    doc.text('CARD SUMMARY REPORT', pageWidth / 2, 20, { align: 'center' });
    doc.setFont(undefined as any, 'normal');

    doc.setFontSize(10);
    doc.text(this.getFilterText(), pageWidth / 2, 30, { align: 'center' });

    autoTable(doc, {
      startY: 40,
      head: [['Sr No', 'ID Number', 'Name', 'Card Type', 'NRD', 'Building', 'Flat', 'CSN', 'Status']],
      body: data.map((v, i) => [
        i + 1,
        v.idNumber,
        v.name,
        this.getCardTypeLabel(v.cardType),
        v.nrd,
        v.building,
        v.flatNumber,
        v.cardCsn,
        v.status
      ]),
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
      theme: 'grid',
      bodyStyles: { fontSize: 9, textColor: [0, 0, 0], fontStyle: 'normal' },
      didDrawPage: (pageData: any) => {
        const pageCount = (doc as any).internal.pages.length - 1;
        doc.setFontSize(9);
        doc.text(`Page ${pageData.pageNumber} of ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
        doc.text('©IDS ID Smart Tech', 10, pageHeight - 10);
      }
    });

    doc.save('CardSummaryReport.pdf');
  }

  exportExcel() {
    this.fetchExportData((data) => {
      if (!data.length) return;

      const workbook  = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('CardSummary');

      worksheet.mergeCells('A1:I1');
      const heading     = worksheet.getCell('A1');
      heading.value     = 'CARD SUMMARY REPORT';
      heading.font      = { bold: true, size: 18 };
      heading.alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:I2');
      const info     = worksheet.getCell('A2');
      info.value     = this.getFilterText();
      info.alignment = { horizontal: 'center' };

      worksheet.addRow([]);

      const headerRow = worksheet.addRow([
        'SR NO', 'ID NUMBER', 'NAME', 'CARD TYPE', 'NRD', 'BUILDING', 'FLAT', 'CSN', 'STATUS'
      ]);
      headerRow.font      = { bold: true, size: 12 };
      headerRow.alignment = { horizontal: 'center' };
      headerRow.eachCell((cell) => {
        cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } };
        cell.border = {
          top:    { style: 'thin', color: { argb: '000000' } },
          left:   { style: 'thin', color: { argb: '000000' } },
          right:  { style: 'thin', color: { argb: '000000' } },
          bottom: { style: 'thin', color: { argb: '000000' } }
        };
      });

      data.forEach((v, i) => {
        worksheet.addRow([
          i + 1,
          v.idNumber,
          v.name,
          this.getCardTypeLabel(v.cardType),
          v.nrd,
          v.building,
          v.flatNumber,
          v.cardCsn,
          v.status
        ]);
      });

      const footerRow = worksheet.lastRow!.number + 2;
      worksheet.mergeCells(`A${footerRow}:I${footerRow}`);
      const gen     = worksheet.getCell(`A${footerRow}`);
      gen.value     = `printed on: ${new Date().toLocaleString()}`;
      gen.alignment = { horizontal: 'center' };

      worksheet.columns.forEach(col => { col.width = 22; });

      workbook.xlsx.writeBuffer().then(buffer => {
        saveAs(new Blob([buffer]), 'CardSummaryReport.xlsx');
      });
    });
  }
}