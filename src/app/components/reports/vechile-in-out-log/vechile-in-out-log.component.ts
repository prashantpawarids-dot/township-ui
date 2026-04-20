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
  selector: 'app-vehicle-in-out',
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
    ArrayJoinPipe          // ← register pipe
  ],
  providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
  templateUrl: './vechile-in-out-log.component.html',
  styleUrls: ['../../../../table.css', './vechile-in-out-log.component.scss']
})
export class VehicleInOutLogComponent implements OnInit, AfterViewInit {

  reportForm: FormGroup;
  vehicleData: any[] = [];
  displayedData: MatTableDataSource<any> = new MatTableDataSource<any>();
  pagedData: any[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  projectList: string[] = [];
  buildingList: string[] = [];
  registerRaw: any[] = [];
  neighbourhoods: any[] = [];
  allBuildings: any[] = [];
  buildings: any[] = [];
  filteredData: any[] = [];

  // ─── Popup ───────────────────────────────────────────────────
  selectedVehicle: any = null;
  openVehiclePopup(d: any) { this.selectedVehicle = d; }
  closeVehiclePopup() { this.selectedVehicle = null; }

  vehicleTypes = [
    { value: 'ALL', label: 'ALL' },
    { value: 'Two Wheeler', label: 'Two Wheeler' },
    { value: 'Four Wheeler', label: 'Four Wheeler' },
    { value: 'Three Wheeler', label: 'Three Wheeler' }
  ];

  inOutOptions = [
    { value: 'ALL', label: 'ALL' },
    { value: 'IN', label: 'IN' },
    { value: 'OUT', label: 'OUT' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sortService: TableSortService
  ) {
    const today = new Date();
    this.reportForm = this.fb.group({
      fromDate: [today],
      toDate:   [today],
      vehicleType:  [[]],
      inOut:        [[]],
      searchBy:     [''],
      searchValue:  [''],
      project:      [[]],
      building:     [[]]
    });
  }

  ngOnInit() {
    this.displayedData.data = [];
    this.pagedData = [];
    this.loadNRDList();
    this.loadBuildingList();
  }

  ngAfterViewInit() { }

  // ── Helper: is ALL selected for a given control ───────────────────────────
  isAllSelected(controlName: string): boolean {
    const val: any[] = this.reportForm.get(controlName)?.value || [];
    return val.includes('ALL');
  }

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

  attachPaginatorSafely() {
    setTimeout(() => {
      if (this.paginator) {
        this.displayedData.paginator = this.paginator;
        this.updatePagination();
      }
    }, 0);
  }

  private generatePlateImg(text: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 180;
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

  loadNRDList() {
    this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe(res => {
      this.neighbourhoods = res.map(n => n.name);
      this.projectList = [...this.neighbourhoods];
    });
  }

  loadBuildingList() {
    this.http.get<any[]>(`${environment.apiurl}Building`).subscribe(res => {
      this.allBuildings = res.map(b => ({
        name: b.name,
        nrdName: b.nrdName
      }));
      this.buildingList = [...new Set(this.allBuildings.map(b => b.name))];
    });
  }

  getSortColumn(): string { return this.sortService.getSortColumn(); }
  getSortDirection(): 'asc' | 'desc' { return this.sortService.getSortDirection(); }

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
      `${environment.apiurl}Report/vehicleInoutLog?cameraId=1` +
      `&fromDateTime=${encodeURIComponent(formatDate(from))}` +
      `&toDateTime=${encodeURIComponent(formatDate(to))}`;

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {

        this.vehicleData = Array.isArray(data)
          ? data.map(v => {

            let finalImg = '';
            const img      = v.cameraImage;
            const frameImg = v.cameraFrameImage;
            let finalFrameImg = '';

            if (frameImg) {
              if (frameImg.startsWith('data:image'))   finalFrameImg = frameImg;
              else if (frameImg.startsWith('http'))     finalFrameImg = frameImg;
              else if (frameImg.length > 50)            finalFrameImg = `data:image/jpeg;base64,${frameImg}`;
              else                                      finalFrameImg = this.resolveImageUrl(frameImg);
            }

            if (img) {
              if (img.startsWith('data:image'))  finalImg = img;
              else if (img.startsWith('http'))   finalImg = img;
              else if (img.length > 50)          finalImg = `data:image/jpeg;base64,${img}`;
              else                               finalImg = this.resolveImageUrl(img);
            }

            return {
              vehicleNumber:   v.vehicleNumber   || '',
              ownerName:       v.ownerName       || '',
              building:        v.building        || '',
              flatNumber:      v.flatNumber      || '',
              cardType:        v.cardType        || '',
              cameraLocation:  v.cameraLocation  || '',
              inoutFlag:       v.inoutFlag       || '',
              inoutTime:       v.inoutTime       || '',
              nrdName:         v.nrd             || '',
              vehicleCategory: v.vType           || '',
              numberPlateImage: finalImg || this.generatePlateImg(v.vehicleNumber || 'UNKNOWN'),
              fullVehicleImage:  finalImg      || 'assets/images/demo-vehicle.jpg',
              cameraFrameImage:  finalFrameImg || finalImg || 'assets/images/demo-vehicle.jpg',
              vMake:     v.vMake    || '',
              stickerNo: v.stickerNo || '',
              vColor:    v.vColor   || ''
            };
          })
          : [];

        this.filteredData         = this.vehicleData;
        this.displayedData.data   = this.vehicleData;

        if (this.paginator) {
          this.paginator.firstPage();
          this.updatePagination();
        }

        if (onLoaded) onLoaded(this.vehicleData);
      },
      error: (err) => {
        console.error('❌ PRODUCTION API ERROR:', err);
      }
    });
  }

  onProjectChange() {
    let selected: string[] = this.reportForm.get('project')?.value || [];

    if (selected.includes('ALL')) {
      // ALL just checked — select all real items
      selected = ['ALL', ...this.projectList];
      this.reportForm.get('project')?.setValue(selected);
    } else {
      // A real item was unchecked — remove ALL, keep only real selected
      const withoutAll = selected.filter(p => p !== 'ALL');
      this.reportForm.get('project')?.setValue(withoutAll);
      selected = withoutAll;
    }

    const realSelected = selected.filter(p => p !== 'ALL');

    if (!realSelected.length) {
      this.buildingList = [...new Set(this.allBuildings.map(b => b.name))];
    } else {
      const filtered = this.allBuildings
        .filter(b => realSelected.includes(b.nrdName))
        .map(b => b.name);
      this.buildingList = [...new Set(filtered)];
    }
  }

  onBuildingChange() {
    let selected: string[] = this.reportForm.get('building')?.value || [];
    if (selected.includes('ALL')) {
      selected = ['ALL', ...this.buildingList];
      this.reportForm.get('building')?.setValue(selected);
    } else {
      const withoutAll = selected.filter(b => b !== 'ALL');
      this.reportForm.get('building')?.setValue(withoutAll);
    }
  }

  onVehicleTypeChange() {
    let selected: string[] = this.reportForm.get('vehicleType')?.value || [];
    if (selected.includes('ALL')) {
      const allValues = ['ALL', ...this.vehicleTypes.filter(v => v.value !== 'ALL').map(v => v.value)];
      this.reportForm.get('vehicleType')?.setValue(allValues);
    } else {
      const withoutAll = selected.filter(v => v !== 'ALL');
      this.reportForm.get('vehicleType')?.setValue(withoutAll);
    }
  }

  onInOutChange() {
    let selected: string[] = this.reportForm.get('inOut')?.value || [];
    if (selected.includes('ALL')) {
      const allValues = ['ALL', ...this.inOutOptions.filter(v => v.value !== 'ALL').map(v => v.value)];
      this.reportForm.get('inOut')?.setValue(allValues);
    } else {
      const withoutAll = selected.filter(v => v !== 'ALL');
      this.reportForm.get('inOut')?.setValue(withoutAll);
    }
  }

  selectAll(type: 'project' | 'building') {
    if (type === 'project') {
      this.reportForm.get('project')?.setValue(['ALL', ...this.projectList]);
      this.onProjectChange();
    } else {
      this.reportForm.get('building')?.setValue(['ALL', ...this.buildingList]);
      this.onBuildingChange();
    }
  }

  fixDateFormat(dateStr: string): Date {
    if (!dateStr) return new Date('');
    if (/T\d{2}:\d{2}:\d{2}\.\d{2}$/.test(dateStr)) dateStr = dateStr + '0';
    return new Date(dateStr);
  }

  // ── PRODUCTION showReports ─────────────────────────────────────────────────
  showReports() {
    const {
      fromDate, toDate,
      vehicleType, inOut,
      searchBy, searchValue,
      project, building
    } = this.reportForm.value;

    // ── Validate: search text needs a type ───────────────────────────────────
    if (searchValue?.trim() && !searchBy) {
      alert('Please select a Search By type before searching.');
      return;
    }

    this.loadVehicleData(
      fromDate ? new Date(fromDate) : new Date(),
      toDate   ? new Date(toDate)   : new Date(),
      (data) => {
        let filtered = [...data];

        // ── Date range filter ─────────────────────────────────────────────────
        if (fromDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0);
          filtered = filtered.filter(x => this.fixDateFormat(x.inoutTime).getTime() >= from.getTime());
        }

        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999);
          filtered = filtered.filter(x => this.fixDateFormat(x.inoutTime).getTime() <= to.getTime());
        }

        // ── Neighbourhood filter ──────────────────────────────────────────────
        const realProjects = (project || []).filter((p: string) => p !== 'ALL');
        if (realProjects.length) {
          filtered = filtered.filter(x => realProjects.includes(x.nrdName));
        }

        // ── Building filter ───────────────────────────────────────────────────
        const realBuildings = (building || []).filter((b: string) => b !== 'ALL');
        if (realBuildings.length) {
          filtered = filtered.filter(x => realBuildings.includes(x.building));
        }

        // ── Vehicle type filter ───────────────────────────────────────────────
        if (vehicleType?.length && !vehicleType.includes('ALL')) {
          filtered = filtered.filter(x =>
            vehicleType.includes((x.vehicleCategory || '').trim())
          );
        }

        // ── IN/OUT filter ─────────────────────────────────────────────────────
        if (inOut?.length && !inOut.includes('ALL')) {
          filtered = filtered.filter(x =>
            inOut.includes((x.inoutFlag || '').toUpperCase())
          );
        }

        // ── Search filter: works like DB LIKE %text% (contains anywhere) ──────
        if (searchValue?.trim() && searchBy) {
          const text = searchValue.trim().toLowerCase();
          filtered = filtered.filter(x =>
            (x[searchBy] || '').toString().toLowerCase().includes(text)
          );
        }

        filtered = sortByTimeOnly(filtered, 'inoutTime', 'asc');
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
      vehicleType: [],
      inOut:       [],
      searchBy:    '',
      searchValue: '',
      project:     [],
      building:    []
    }, { emitEvent: false });

    this.displayedData.data = [];
    this.pagedData = [];

    if (this.paginator) this.paginator.firstPage();
    this.updatePagination();
  }

  updatePagination() {
    if (!this.paginator) return;

    this.paginator.length = this.displayedData.data.length;

    const start = this.paginator.pageIndex * this.paginator.pageSize;
    const end   = start + this.paginator.pageSize;

    this.pagedData = this.displayedData.data.slice(start, end);
  }

  openImage(imgUrl: string) {
    window.open(imgUrl, '_blank');
  }

  private resolveImageUrl(imageUrl: string): string {
    if (!imageUrl) return '';
    if (imageUrl.startsWith('data:image')) return imageUrl;
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
      doc.text(`Printed On: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, pageWidth - 10, 20, { align: 'right' });

      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('VEHICLE IN/OUT REPORT', pageWidth / 2, 20, { align: 'center' });
      doc.setFont(undefined, 'normal');

      const dates = this.filteredData.map(d => new Date(d.inoutTime)).filter(d => !isNaN(d.getTime()));
      let dateText = '';
      if (dates.length) {
        const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
        dateText = `From: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`;
      }

      if (dateText) {
        doc.setFontSize(10);
        doc.text(dateText, pageWidth / 2, 30, { align: 'center' });
      }

      autoTable(doc, {
        startY: 40,
        styles: { minCellHeight: 14 },
        head: [['Sr No', 'Vehicle No', 'Vehicle Type', 'Name', 'Building', 'Flat',
          'Location', 'IN/OUT', 'Time & Date', 'Image', 'Neighbourhood']],
        body: this.filteredData.map((v, i) => [
          i + 1, v.vehicleNumber, v.vehicleCategory, v.ownerName, v.building,
          v.flatNumber, v.cameraLocation, v.inoutFlag, v.inoutTime, '', v.nrdName
        ]),
        columnStyles: { 9: { cellWidth: 38 } },
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
        theme: 'grid',
        bodyStyles: { fontSize: 9, textColor: [0, 0, 0], fontStyle: 'normal' },
        didDrawCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 9) {
            const v = this.filteredData[data.row.index];
            if (v?.numberPlateImage) {
              doc.addImage(v.numberPlateImage, 'PNG',
                data.cell.x + 1, data.cell.y + 1,
                data.cell.width - 2, data.cell.height - 2);
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

      doc.save('VehicleInOutReport.pdf');
    };
  }

  exportExcel() {
    if (!this.filteredData.length) return;

    const f         = this.reportForm.value;
    const from      = f.fromDate ? new Date(f.fromDate).toLocaleDateString() : null;
    const to        = f.toDate   ? new Date(f.toDate).toLocaleDateString()   : null;
    const generated = new Date().toLocaleString();

    const workbook  = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('VehicleInOut');

    worksheet.mergeCells('A1:K1');
    const headingCell    = worksheet.getCell('A1');
    headingCell.value    = 'VEHICLE IN/OUT REPORT';
    headingCell.font     = { bold: true, size: 18 };
    headingCell.alignment = { horizontal: 'center' };

    let currentRow = 2;

    if (from && to) {
      worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
      const dateCell      = worksheet.getCell(`A${currentRow}`);
      dateCell.value      = `from: ${from} to ${to}`;
      dateCell.alignment  = { horizontal: 'center' };
      currentRow++;
    }

    currentRow++;

    worksheet.addRow(['SR NO', 'VEHICLE NUMBER', 'Vehicle Type', 'NAME', 'BUILDING', 'FLAT No',
      'LOCATION', 'IN / OUT', 'TIME and DATE', 'NUMBER PLATE', 'NEIGHBOURHOOD']);

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

    this.filteredData.forEach((v, i) => {
      const dbTime = DateTimeUtil.formatDateTime(v.inoutTime);
      const row    = worksheet.addRow([
        i + 1, v.vehicleNumber, v.vehicleCategory, v.ownerName, v.building, v.flatNumber,
        v.cameraLocation, v.inoutFlag, dbTime, '', v.nrdName
      ]);

      row.height = 38;

      if (v.numberPlateImage) {
        const imgId = workbook.addImage({
          base64:    v.numberPlateImage.split(',')[1],
          extension: 'png'
        });
        worksheet.addImage(imgId, {
          tl:     { col: 9,  row: row.number - 1 },
          br:     { col: 10, row: row.number },
          editAs: 'oneCell'
        } as any);
      }
    });

    currentRow = worksheet.lastRow!.number + 1;

    worksheet.mergeCells(`A${currentRow}:K${currentRow}`);
    const genCell      = worksheet.getCell(`A${currentRow}`);
    genCell.value      = `printed on: ${generated}`;
    genCell.alignment  = { horizontal: 'center' };

    worksheet.columns.forEach(col => { col.width = 20; });

    workbook.xlsx.writeBuffer().then(buffer => {
      saveAs(new Blob([buffer]), 'VehicleInOutReport.xlsx');
    });
  }
}

