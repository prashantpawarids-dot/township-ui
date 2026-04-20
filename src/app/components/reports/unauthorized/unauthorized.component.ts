import { Component, ViewChild, OnInit, AfterViewInit, Pipe, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule as NgCommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';
import { sortByTimeOnly } from 'src/app/_core/shared/utils/sort.util';
import { DateTimeUtil } from 'src/app/_core/shared/utils//datetime.util';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import { DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from 'src/app/_core/shared/utils/custom-date-adapter';
import { LoaderService } from 'src/app/_core/shared/utils/loader.service';

// ── Pipe: joins array values for mat-select-trigger display ──────────────────
@Pipe({ name: 'arrayJoin', standalone: true })
export class ArrayJoinPipe implements PipeTransform {
  transform(value: any[]): string {
    if (!value || !value.length) return '';
    const real = value.filter(v => v !== 'ALL');
    return real.join(', ');
  }
}

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [
    CommonModule,
    NgCommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    HttpClientModule,
    MatIconModule,
    ArrayJoinPipe
  ],
  providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
  templateUrl: './unauthorized.component.html',
  styleUrls: ['../../../../table.css', './unauthorized.component.scss']
})
export class UnauthorizedComponent implements OnInit, AfterViewInit {

  reportForm: FormGroup;
  vehicleData: any[] = [];
  displayedData: MatTableDataSource<any> = new MatTableDataSource<any>();
  pagedData: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filteredData: any[] = [];

  // ─── Popup ───────────────────────────────────────────────────
  selectedVehicle: any = null;
  selectedVehicleImage: string = '';
  private prevInOut: string[] = [];

openVehiclePopup(d: any, type: 'in' | 'out') {
  this.selectedVehicle = d;

  const rawImage = type === 'out'
    ? (d.outCameraImageRaw || d.inCameraImageRaw)
    : d.inCameraImageRaw;

  if (!rawImage) {
    this.selectedVehicleImage = 'assets/images/demo-vehicle.jpg';
    return;
  }

  if (rawImage.startsWith('data:image')) {
    this.selectedVehicleImage = rawImage;
    return;
  }

  if (rawImage.startsWith('http')) {
    this.selectedVehicleImage = rawImage;
    return;
  }

  if (rawImage.startsWith('assets/')) {
    this.selectedVehicleImage = rawImage;
    return;
  }

  if (rawImage.length > 50) {
    this.selectedVehicleImage = `data:image/jpeg;base64,${rawImage}`;
    return;
  }

  this.selectedVehicleImage = this.resolveImageUrl(rawImage);
}

  closeVehiclePopup() {
    this.selectedVehicle = null;
    this.selectedVehicleImage = '';
  }

  // IN/OUT filter options — no "ALL" toggle needed, kept simple with ALL option
  inOutOptions = [
    { value: 'ALL', label: 'ALL' },
    { value: 'IN',  label: 'IN'  },
    { value: 'OUT', label: 'OUT' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sortService: TableSortService,
     private loaderService: LoaderService
  ) {
    const today = new Date();
    this.reportForm = this.fb.group({
      fromDate:    [today],
      toDate:      [today],
      inOut:       [[]],
      searchValue: ['']
    });
  }

  ngOnInit() {
    this.displayedData.data = [];
    this.pagedData = [];
  }

  ngAfterViewInit() { }

  // ── Helper: show selected labels (excluding ALL) joined by comma ──────────
  getSelectedLabels(controlName: string, options: { value: string; label: string }[]): string {
    const selected: string[] = this.reportForm.get(controlName)?.value || [];
    const real = selected.filter(v => v !== 'ALL');
    if (!real.length) return '';
    return options
      .filter(o => real.includes(o.value))
      .map(o => o.label)
      .join(', ');
  }

  // onInOutChange() {
  //   let selected: string[] = this.reportForm.get('inOut')?.value || [];
  //   if (selected.includes('ALL')) {
  //     const allValues = ['ALL', ...this.inOutOptions.filter(v => v.value !== 'ALL').map(v => v.value)];
  //     this.reportForm.get('inOut')?.setValue(allValues);
  //   } else {
  //     const withoutAll = selected.filter(v => v !== 'ALL');
  //     this.reportForm.get('inOut')?.setValue(withoutAll);
  //   }
  // }


  onInOutChange() {
  const selected: string[] = this.reportForm.get('inOut')?.value || [];
  const allValues = this.inOutOptions.filter(v => v.value !== 'ALL').map(v => v.value);

  const hadAll = this.prevInOut.includes('ALL');
  const hasAll = selected.includes('ALL');

  let newValue: string[];

  if (!hadAll && hasAll) {
    // User clicked ALL now → select everything
    newValue = ['ALL', ...allValues];
  } else if (hadAll && hasAll) {
    // User had ALL before and now unchecked one real item
    // remove ALL and keep only actually selected items
    newValue = selected.filter(v => v !== 'ALL');
  } else {
    // Normal selection flow
    newValue = selected.filter(v => v !== 'ALL');

    // If user manually selected all real options, auto-add ALL
    if (allValues.every(v => newValue.includes(v))) {
      newValue = ['ALL', ...allValues];
    }
  }

  this.prevInOut = [...newValue];
  this.reportForm.get('inOut')?.setValue(newValue, { emitEvent: false });
}

  public sortColumn(column: string) {
    if (column === 'srNo') return;

    if (this.sortService.getSortColumn() === column) {
      this.sortService.toggleDirection();
    } else {
      this.sortService.setSortColumn(column, 'asc');
    }

    const sortedData = this.sortService.sortData([...this.displayedData.data], column);
    this.displayedData.data = sortedData;
    this.paginator.firstPage();
    this.updatePagination();
  }

  getSortColumn(): string { return this.sortService.getSortColumn(); }
  getSortDirection(): 'asc' | 'desc' { return this.sortService.getSortDirection(); }

  //Production version would call API with filters and get already filtered/sorted/paged data. Here we load all and do it client-side for demo/testing purposes.

loadVehicleData(fromDate?: Date, toDate?: Date, onLoaded?: (data: any[]) => void) {
  const from = fromDate || new Date();
  const to   = toDate   || new Date();

  const formatDate = (d: Date) => {
    const day   = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year  = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const apiUrl =
    `${environment.apiurl}Report/UnAuthorisedVehicleInoutRegister` +
    `?fromDateTime=${encodeURIComponent(formatDate(from))}` +
    `&toDateTime=${encodeURIComponent(formatDate(to))}`;

  this.loaderService.show();

  this.http.get<any[]>(apiUrl).subscribe({
    next: (data) => {
      this.vehicleData = Array.isArray(data)
        ? data.map(v => {
            const inoutFlag = v.outTime && !v.inTime ? 'OUT' : 'IN';

            return {
              id:                v.id || v.vehicleNumber || '',
              vehicleNumber:     v.vehicleNumber     || '',
              tagUID:            v.tagUID            || '',
              idNumber:          v.idNumber          || '',
              ownerName:         v.ownerName         || '',
              building:          v.building          || '',
              cardType:          v.cardType          || '',
              flatNumber:        v.flatNumber        || '',
              inCameraLocation:  v.inCameraLocation  || '',
              outCameraLocation: v.outCameraLocation || '',
              inTime:            v.inTime            || '',
              outTime:           v.outTime           || '',
              inoutFlag,

              // Keep table data light for fast search/filter
              inCameraImageRaw:  v.inCameraImage || '',
              outCameraImageRaw: v.outCameraImage || '',

              // Lightweight default image for number plate export/display
              numberPlateImage: this.generatePlateImg(v.vehicleNumber || 'UNKNOWN'),

              // Do not process heavy images here
              inCameraImage: '',
              outCameraImage: ''
            };
          })
        : [];

      this.filteredData       = this.vehicleData;
      this.displayedData.data = this.vehicleData;

      if (this.paginator) {
        this.paginator.firstPage();
        this.updatePagination();
      }

      if (onLoaded) onLoaded(this.vehicleData);
      this.loaderService.hide();
    },
    error: (err) => {
      console.error('❌ API ERROR (Unauthorized):', err);
      this.loaderService.hide();
    }
  });
}


// ── Mock data loader with 3 sec delay to test loader and performance with large data ───────────────
// loadVehicleData(fromDate?: Date, toDate?: Date, onLoaded?: (data: any[]) => void) {
//   const from = fromDate || new Date();
//   const to   = toDate   || new Date();

//   this.loaderService.show();

//   setTimeout(() => {
//     const testData = Array.from({ length: 5000 }, (_, i) => {
//       const hasOut = i % 3 === 0;

//       return {
//         id: i + 1,
//         vehicleNumber: `MH12AB${String(i).padStart(4, '0')}`,
//         tagUID: `TAG${i + 1000}`,
//         idNumber: `ID${i + 1}`,
//         ownerName: `Owner ${i + 1}`,
//         building: `Building ${((i % 5) + 1)}`,
//         cardType: 'Visitor',
//         flatNumber: `${(i % 20) + 1}0${(i % 10) + 1}`,
//         inCameraLocation: 'Main Gate IN',
//         outCameraLocation: hasOut ? 'Main Gate OUT' : '',
//         inTime: new Date(from.getTime() + i * 60000).toISOString(),
//         outTime: hasOut ? new Date(to.getTime() + i * 60000).toISOString() : '',
//         inoutFlag: hasOut ? 'OUT' : 'IN',

//         // fake raw image text
//         inCameraImageRaw: '',
//         outCameraImageRaw: '',

//         // lightweight plate image
//         numberPlateImage: this.generatePlateImg(`MH12AB${String(i).padStart(4, '0')}`),

//         inCameraImage: '',
//         outCameraImage: ''
//       };
//     });

//     this.vehicleData = testData;
//     this.filteredData = testData;
//     this.displayedData.data = testData;

//     if (this.paginator) {
//       this.paginator.firstPage();
//       this.updatePagination();
//     }

//     if (onLoaded) onLoaded(this.vehicleData);

//     this.loaderService.hide();
//   }, 3000); // 3 sec delay to test loader properly
// }

  fixDateFormat(dateStr: string): Date {
    if (!dateStr) return new Date('');
    if (/T\d{2}:\d{2}:\d{2}\.\d{2}$/.test(dateStr)) dateStr = dateStr + '0';
    return new Date(dateStr);
  }

  showReports() {
    const { fromDate, toDate, inOut, searchValue } = this.reportForm.value;

    this.loadVehicleData(
      fromDate ? new Date(fromDate) : new Date(),
      toDate   ? new Date(toDate)   : new Date(),
      (data) => {
        let filtered = [...data];

        // ── Date range filter (on inTime) ─────────────────────────────────────
        if (fromDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          filtered = filtered.filter(x => this.fixDateFormat(x.inTime).getTime() >= from.getTime());
        }

        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          filtered = filtered.filter(x => this.fixDateFormat(x.inTime).getTime() <= to.getTime());
        }

        // ── IN/OUT filter ─────────────────────────────────────────────────────
        if (inOut?.length && !inOut.includes('ALL')) {
          filtered = filtered.filter(x =>
            inOut.includes((x.inoutFlag || '').toUpperCase())
          );
        }

        // ── Vehicle No search — DB-style LIKE %text% (contains anywhere) ──────
        const text = (searchValue || '').trim().toLowerCase();
        if (text) {
          filtered = filtered.filter(x =>
            (x.vehicleNumber || '').toLowerCase().includes(text)
          );
        }

        filtered = sortByTimeOnly(filtered, 'inTime', 'asc');
        this.filteredData       = filtered;
        this.displayedData.data = filtered;
        this.paginator.firstPage();
        this.updatePagination();
      }
    );
  }

  showAll() {
    this.reportForm.reset({
      fromDate:    '',
      toDate:      '',
      inOut:       [],
      searchValue: ''
    }, { emitEvent: false });

    this.displayedData.data = [];
    this.filteredData       = [];
    this.pagedData          = [];
    this.prevInOut = [];

    if (this.paginator) this.paginator.firstPage();
    this.updatePagination();
  }

//   showAll() {
//   this.reportForm.reset({
//     fromDate:    null,
//     toDate:      null,
//     inOut:       [],
//     searchValue: ''
//   }, { emitEvent: false });

//   // load all data with wide range
//   this.loadVehicleData(new Date('2000-01-01'), new Date('2099-12-31'), (data) => {
//     this.filteredData       = data;
//     this.displayedData.data = data;
//     if (this.paginator) this.paginator.firstPage();
//     this.updatePagination();
//   });
// }


  All() {
  this.reportForm.reset({
    fromDate:    null,
    toDate:      null,
    inOut:       [],
    searchValue: ''
  }, { emitEvent: false });

  // load all data with wide range
  this.loadVehicleData(new Date('2000-01-01'), new Date('2099-12-31'), (data) => {
    this.filteredData       = data;
    this.displayedData.data = data;
    if (this.paginator) this.paginator.firstPage();
    this.updatePagination();
  });
}



  updatePagination() {
    if (!this.paginator) return;

    this.paginator.length = this.displayedData.data.length;

    const start = this.paginator.pageIndex * this.paginator.pageSize;
    const end   = start + this.paginator.pageSize;

    this.pagedData = this.displayedData.data.slice(start, end);
  }

  private generatePlateImg(text: string): string {
    const canvas = document.createElement('canvas');
    canvas.width  = 180;
    canvas.height = 50;
    const ctx = canvas.getContext('2d')!;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 180, 50);

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.strokeRect(2, 2, 176, 46);

    ctx.fillStyle = '#003399';
    ctx.fillRect(2, 2, 22, 46);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('IND', 13, 30);

    ctx.fillStyle = '#000000';
    ctx.font = 'bold 17px monospace';
    ctx.fillText(text || 'UNKNOWN', 102, 32);

    return canvas.toDataURL('image/png');
  }

private resolveImageUrl(imageUrl: string): string {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('data:image')) return imageUrl;
  if (imageUrl.startsWith('assets/'))    return imageUrl;  // ← NEW LINE
  if (!imageUrl.startsWith('http')) return `${environment.apiurl}${imageUrl}`;

    try {
      const apiBase = new URL(environment.apiurl);
      const imgUrl  = new URL(imageUrl);
      imgUrl.protocol = apiBase.protocol;
      imgUrl.hostname = apiBase.hostname;
      imgUrl.port     = apiBase.port;
      return imgUrl.toString();
    } catch {
      return imageUrl;
    }
  }

  exportPDF() {
    if (!this.filteredData.length) return;

    const doc  = new jsPDF('l', 'mm', 'a4');
    const logo = new Image();
    logo.src   = 'assets/images/logo/logo.jpeg';

    logo.onload = () => {
      const pageWidth  = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.addImage(logo, 'JPEG', 10, 10, 25, 25);

      const now = new Date();
      doc.setFontSize(9);
      doc.text(
        `Printed On: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
        pageWidth - 10, 20, { align: 'right' }
      );

      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('UNAUTHORIZED VEHICLE REPORT', pageWidth / 2, 20, { align: 'center' });
      doc.setFont(undefined, 'normal');

      const dates = this.filteredData
        .map(d => new Date(d.inTime))
        .filter(d => !isNaN(d.getTime()));

      if (dates.length) {
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        doc.setFontSize(10);
        doc.text(
          `From: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`,
          pageWidth / 2, 30, { align: 'center' }
        );
      }

      autoTable(doc, {
        startY: 40,
        styles: { minCellHeight: 14 },
        head: [[
          'Sr No', 'Vehicle No', 'Tag UID', 'Name',
           'IN Location', 'OUT Location', 'IN Time', 'OUT Time', 'Image'
        ]],
        body: this.filteredData.map((v, i) => [
          i + 1,
          v.vehicleNumber,
          v.tagUID,
          v.ownerName,
         
          v.inCameraLocation,
          v.outCameraLocation,
          v.inTime  ? new Date(v.inTime).toLocaleString()  : '',
          v.outTime ? new Date(v.outTime).toLocaleString() : '',
          ''
        ]),
        columnStyles: { 11: { cellWidth: 38 } },
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
        theme: 'grid',
        bodyStyles: { fontSize: 9, textColor: [0, 0, 0], fontStyle: 'normal' },
        didDrawCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 11) {
            const v = this.filteredData[data.row.index];
            if (v?.numberPlateImage) {
              doc.addImage(
                v.numberPlateImage, 'PNG',
                data.cell.x + 1, data.cell.y + 1,
                data.cell.width - 2, data.cell.height - 2
              );
            }
          }
        },
        didDrawPage: (data: any) => {
          const currentPage = data.pageNumber;
          const pageCount   = (doc as any).internal.pages.length - 1;
          doc.setFontSize(9);
          doc.text(`Page ${currentPage} of ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
          doc.text('©IDS ID Smart Tech', 10, pageHeight - 10);
        }
      });

      doc.save('UnauthorizedVehicleReport.pdf');
    };
  }

 exportExcel() {
    if (!this.filteredData.length) return;

    const f         = this.reportForm.value;
    const from      = f.fromDate ? new Date(f.fromDate).toLocaleDateString() : null;
    const to        = f.toDate   ? new Date(f.toDate).toLocaleDateString()   : null;
    const generated = new Date().toLocaleString();

    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('UnauthorizedVehicle');

    // ── Heading row ───────────────────────────────────────────────────────────
    worksheet.mergeCells('A1:L1');
    const headingCell     = worksheet.getCell('A1');
    headingCell.value     = 'UNAUTHORIZED VEHICLE REPORT';
    headingCell.font      = { bold: true, size: 18 };
    headingCell.alignment = { horizontal: 'center' };

    let currentRow = 2;

    if (from && to) {
      worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
      const dateCell     = worksheet.getCell(`A${currentRow}`);
      dateCell.value     = `from: ${from} to ${to}`;
      dateCell.alignment = { horizontal: 'center' };
      currentRow++;
    }

    currentRow++; // blank spacer row

    // ── Column header row ─────────────────────────────────────────────────────
    worksheet.addRow([
      'SR NO', 'VEHICLE NUMBER', 'TAG UID', 'NAME',  'IN LOCATION', 'OUT LOCATION', 'IN TIME', 'OUT TIME', 'NUMBER PLATE'
    ]);

    const headerRow = worksheet.getRow(currentRow);
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

    currentRow++;

    // ── Data rows ─────────────────────────────────────────────────────────────
    this.filteredData.forEach((v, i) => {
      const inFormatted  = DateTimeUtil.formatDateTime(v.inTime);
      const outFormatted = v.outTime ? DateTimeUtil.formatDateTime(v.outTime) : '';

      const row = worksheet.addRow([
        i + 1,
        v.vehicleNumber,
        v.tagUID,
        v.ownerName,
       
        v.inCameraLocation,
        v.outCameraLocation,
        inFormatted,
        outFormatted,
        ''
      ]);

      row.height = 38;

      // ── Only embed image if it is real base64 data ────────────────────────
      if (v.numberPlateImage && v.numberPlateImage.startsWith('data:image')) {
        const imgId = workbook.addImage({
          base64:    v.numberPlateImage.split(',')[1],
          extension: 'png'
        });
        worksheet.addImage(imgId, {
          tl:     { col: 11, row: row.number - 1 },
          br:     { col: 12, row: row.number },
          editAs: 'oneCell'
        } as any);
      }
    });

    // ── Footer: printed on ────────────────────────────────────────────────────
    currentRow = worksheet.lastRow!.number + 1;
    worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
    const genCell     = worksheet.getCell(`A${currentRow}`);
    genCell.value     = `printed on: ${generated}`;
    genCell.alignment = { horizontal: 'center' };

    worksheet.columns.forEach(col => { col.width = 20; });

    workbook.xlsx.writeBuffer().then(buffer => {
      saveAs(new Blob([buffer]), 'UnauthorizedVehicleReport.xlsx');
    });
  }
}