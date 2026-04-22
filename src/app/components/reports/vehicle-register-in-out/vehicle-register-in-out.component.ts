import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { sortByTimeOnly } from 'src/app/_core/shared/utils/sort.util';
import { DateTimeUtil } from 'src/app/_core/shared/utils/datetime.util';
import { DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from 'src/app/_core/shared/utils/custom-date-adapter';

@Component({
  selector: 'app-vehicle-in-out-log',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    HttpClientModule
  ],
  providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
  templateUrl: './vehicle-register-in-out.component.html',
  styleUrls: ['../../../../table.css', './vehicle-register-in-out.component.scss']
})
export class VehicleRegisterInOutComponent implements OnInit, AfterViewInit {

  reportForm: FormGroup;
  vehicleData: any[] = [];
  displayedData = new MatTableDataSource<any>([]);
  pageSizes = [10, 25, 50, 100, 150, 200];
  buildings: string[] = [];
  allBuildings: string[] = [];
  filteredData: any[] = [];

  // ─── Popup ───────────────────────────────────────────────────
  selectedVehicle: any = null;

  // openVehiclePopup(d: any, type: 'in' | 'out') {
  //   this.selectedVehicle = {
  //     ...d,
  //     activeImage:  type === 'in' ? d.inCameraImage       : d.outCameraImage,
  //     frameImage:   type === 'in' ? d.inCameraFrameImage   : d.outCameraFrameImage,
  //     activeLabel:  type === 'in' ? 'IN' : 'OUT'
  //   };
  // }


  openVehiclePopup(d: any, type: 'in' | 'out') {
  this.selectedVehicle = {
    ...d,
    frameImage: type === 'in' ? d.inCameraFrameImage : d.outCameraFrameImage,
    activeLabel: type === 'in' ? 'IN' : 'OUT'
  };
}

  closeVehiclePopup() { this.selectedVehicle = null; }

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  searchType = [
    { value: 'vehicleNumber', label: 'Vehicle Number' },
    { value: 'ownerName',     label: 'Owner Name' },
    { value: 'flatNumber',    label: 'Flat Number' }
  ];

  displayColumns = [
    'srNo', 'vehicleNumber', 'ownerName', 'building', 'flatNumber',
    'inCameraImage', 'outCameraImage', 'inTime', 'outTime'
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sortService: TableSortService
  ) {
    const today = new Date();
    this.reportForm = this.fb.group({
      fromDate:    [today],
      fromTime:    [''],
      toDate:      [today],
      toTime:      [''],
      buildings:   [[]],
      searchType:  [''],
      searchValue: ['']
    });
  }

  ngOnInit() {
    this.loadVehicleData();
    this.loadBuildingList();
  }

  ngAfterViewInit() {
    this.displayedData.paginator = this.paginator;
  }

  get paginatedData() {
    if (!this.paginator) return this.displayedData.data;
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return this.displayedData.data.slice(startIndex, startIndex + this.paginator.pageSize);
  }

  // ── Building trigger label: show all real selected names, never "ALL" ──────
  getBuildingTriggerLabel(): string {
    const selected: string[] = this.reportForm.get('buildings')?.value || [];
    const real = selected.filter(b => b !== 'ALL');
    return real.join(', ');
  }

  loadVehicleData(fromDate?: Date, toDate?: Date) {

    const from = fromDate || this.reportForm.value.fromDate || new Date();
    const to   = toDate   || this.reportForm.value.toDate   || new Date();

    const formatDate = (d: Date) => {
      const day   = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('en-US', { month: 'short' });
      const year  = d.getFullYear();
      return `${day}-${month}-${year}`;
    };

    const apiUrl =
      `${environment.apiurl}Report/vehicleInoutRegister` +
      `?fromDateTime=${encodeURIComponent(formatDate(from))}` +
      `&toDateTime=${encodeURIComponent(formatDate(to))}`;

    this.http.get<any[]>(apiUrl).subscribe({
      next: (data) => {

        if (!Array.isArray(data)) {
          this.vehicleData      = [];
          this.displayedData.data = [];
          return;
        }

        const formatImage = (img: any): string | null => {
          if (!img || typeof img !== 'string') return null;
          if (img.startsWith('data:image')) return img;
          if (img.startsWith('http'))        return img;
          if (img.length > 50)               return `data:image/jpeg;base64,${img}`;
          return null;
        };

        this.vehicleData = data.map(v => ({
          vehicleNumber:       v.vehicleNumber       || '',
          ownerName:           v.ownerName           || '',
          building:            v.building            || '',
          flatNumber:          v.flatNumber          || '',
          vehicleCategory: v.vType || '',
          inCameraImage:       formatImage(v.inCameraImage),
          outCameraImage:      formatImage(v.outCameraImage),
          inCameraFrameImage:  formatImage(v.inCameraFrameImage),
          outCameraFrameImage: formatImage(v.outCameraFrameImage),

          //  inCameraImage: 'https://imgs.search.brave.com/hm32eGAdBnA5XQnorYeu-pM_zcH_iLkTrBocad73SuM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy8w/LzA2L0ZyZW5jaE51/bWJlclBsYXRlcy5q/cGc',
          // inCameraFrameImage: 'https://imgs.search.brave.com/zXyfwrAgFvltIfbpa-zA_aNE67iPKmqha3Dkp4rBxk4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5zcHluZWFpLmNv/bS91bnNhZmUvZmls/dGVyczpmb3JtYXQo/d2VicCkvaHR0cHM6/Ly9zcHluZS1zdGF0/aWMuczMudXMtZWFz/dC0xLmFtYXpvbmF3/cy5jb20vcGx1Z2lu/LWxpYnJhcnkvZHVt/bXkrbnVtYmVyK3Rv/b2wvY2FyK2ltYWdl/KzFfMTF6b24uanBn',
          // outCameraImage: 'https://imgs.search.brave.com/hm32eGAdBnA5XQnorYeu-pM_zcH_iLkTrBocad73SuM/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly91cGxv/YWQud2lraW1lZGlh/Lm9yZy93aWtpcGVk/aWEvY29tbW9ucy8w/LzA2L0ZyZW5jaE51/bWJlclBsYXRlcy5q/cGc',
          // outCameraFrameImage: 'https://imgs.search.brave.com/zXyfwrAgFvltIfbpa-zA_aNE67iPKmqha3Dkp4rBxk4/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5zcHluZWFpLmNv/bS91bnNhZmUvZmls/dGVyczpmb3JtYXQo/d2VicCkvaHR0cHM6/Ly9zcHluZS1zdGF0/aWMuczMudXMtZWFz/dC0xLmFtYXpvbmF3/cy5jb20vcGx1Z2lu/LWxpYnJhcnkvZHVt/bXkrbnVtYmVyK3Rv/b2wvY2FyK2ltYWdl/KzFfMTF6b24uanBn',

          inTime:              v.inTime  || null,
          outTime:             v.outTime || null
        }));

        this.filteredData       = [...this.vehicleData];
        this.displayedData.data = this.vehicleData;
        this.applyFilters();

        if (this.paginator) this.paginator.firstPage();
      },
      error: (err) => {
        console.error('❌ API Error:', err);
        this.vehicleData        = [];
        this.displayedData.data = [];
      }
    });
  }

  loadBuildingList() {
    this.http.get<any[]>(`${environment.apiurl}Building`).subscribe(
      res => {
        this.allBuildings = res.map(b => b.name);
        this.buildings    = [...this.allBuildings];
      },
      err => console.error('Error fetching buildings:', err)
    );
  }

  // ── Building change: select ALL → expand; uncheck any item → remove ALL ────
  onBuildingChange() {
    let selected: string[] = this.reportForm.get('buildings')?.value || [];

    if (selected.includes('ALL')) {
      // ALL just got checked → select every real building
      this.reportForm.patchValue({ buildings: ['ALL', ...this.allBuildings] });
    } else {
      // A real item was unchecked → strip ALL, keep only what's checked
      const withoutAll = selected.filter(b => b !== 'ALL');
      this.reportForm.patchValue({ buildings: withoutAll });
    }
  }

  public sortColumn(column: string) {
    if (column === 'srNo') return;

    if (this.sortService.getSortColumn() === column) {
      this.sortService.toggleDirection();
    } else {
      this.sortService.setSortColumn(column, 'asc');
    }

    this.displayedData.data = this.sortService.sortData([...this.displayedData.data], column);
    this.paginator.firstPage();
  }

  getSortColumn(): string            { return this.sortService.getSortColumn(); }
  getSortDirection(): 'asc' | 'desc' { return this.sortService.getSortDirection(); }

  clear() {
    this.reportForm.reset({
      buildings:   [],
      searchType:  '',
      searchValue: '',
      fromDate:    '',
      toDate:      ''
    });

    this.displayedData.data = [];
    if (this.paginator) this.paginator.firstPage();
  }

  showReports() {
    const fromDate = this.reportForm.value.fromDate;
    const toDate   = this.reportForm.value.toDate;
    this.loadVehicleData(fromDate, toDate);
  }

  private applyFilters() {
    let result = [...this.vehicleData];

    const fromDate   = this.reportForm.get('fromDate')?.value;
    const fromTime   = this.reportForm.get('fromTime')?.value;
    const toDate     = this.reportForm.get('toDate')?.value;
    const toTime     = this.reportForm.get('toTime')?.value;
    const buildings  = this.reportForm.get('buildings')?.value || [];
    const searchType = this.reportForm.get('searchType')?.value;
    const searchValue = (this.reportForm.get('searchValue')?.value || '').toString().trim().toLowerCase();

    // ── Date / time filter ──────────────────────────────────────────────────
    if (fromDate) {
      const from = new Date(fromDate);
      fromTime
        ? (() => { const [h, m] = fromTime.split(':').map(Number); from.setHours(h, m, 0, 0); })()
        : from.setHours(0, 0, 0, 0);
      result = result.filter(v => new Date(v.inTime) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      toTime
        ? (() => { const [h, m] = toTime.split(':').map(Number); to.setHours(h, m, 59, 999); })()
        : to.setHours(23, 59, 59, 999);
      result = result.filter(v => new Date(v.inTime) <= to);
    }

    // ── Building filter: use real items only (ignore ALL token) ─────────────
    const realBuildings = buildings.filter((b: string) => b !== 'ALL');
    if (realBuildings.length > 0) {
      result = result.filter(v => realBuildings.includes(v.building));
    }

    // ── Search filter: LIKE %text% (contains anywhere, like DB) ─────────────
    if (searchValue.length > 0) {
      if (!searchType) {
        alert('Please select a search type');
        this.displayedData.data = [];
        return;
      }
      result = result.filter(v =>
        (v[searchType] || '').toString().toLowerCase().includes(searchValue)
      );
    }

    result = sortByTimeOnly(result, 'inTime', 'asc');
    this.filteredData       = result;
    this.displayedData.data = result;

    if (this.paginator) this.paginator.firstPage();
  }

  /* ─── PDF EXPORT ─────────────────────────────────────────────── */
  exportReports() {
    if (this.filteredData.length === 0) return;

    const doc         = new jsPDF('l', 'mm', 'a4');
    const logo        = new Image();
    logo.src          = 'assets/images/logo/logo.jpeg';
    const generatedOn = new Date().toLocaleString('en-GB');

    const validDates  = this.filteredData
      .map(v => v.inTime ? new Date(v.inTime) : null)
      .filter(d => d !== null);

    const minDate      = validDates.length ? new Date(Math.min(...validDates.map(d => d!.getTime()))) : null;
    const maxDate      = validDates.length ? new Date(Math.max(...validDates.map(d => d!.getTime()))) : null;
    const formattedFrom = minDate ? minDate.toLocaleDateString('en-GB') : 'N/A';
    const formattedTo   = maxDate ? maxDate.toLocaleDateString('en-GB') : 'N/A';

    logo.onload = () => {
      const pageWidth  = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.addImage(logo, 'JPEG', 10, 10, 18, 18);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('VEHICLE IN - OUT - Register REPORT', pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`From: ${formattedFrom}   To: ${formattedTo}`, pageWidth / 2, 28, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Printed On: ${generatedOn}`, pageWidth - 10, 12, { align: 'right' });

      autoTable(doc, {
        startY: 40,
        theme: 'grid',
        styles: { minCellHeight: 20 },
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
        bodyStyles: { fontSize: 9, textColor: [0, 0, 0], fontStyle: 'normal' },
        head: [['SR NO', 'VEHICLE', 'OWNER', 'BUILDING', 'FLAT', 'IN TIME', 'IN IMAGE', 'OUT TIME', 'OUT IMAGE']],
        body: this.filteredData.map((v, i) => [
          i + 1, v.vehicleNumber, v.ownerName, v.building, v.flatNumber,
          v.inTime  ? new Date(v.inTime).toLocaleString('en-GB')  : '',
          '',
          v.outTime ? new Date(v.outTime).toLocaleString('en-GB') : '',
          ''
        ]),
        columnStyles: { 6: { cellWidth: 40 }, 8: { cellWidth: 40 } },
        didDrawCell: (data: any) => {
          const v = this.filteredData[data.row.index];

          if (data.section === 'body' && data.column.index === 6) {
            let y = data.cell.y + 1;
            if (v?.inCameraImage) {
              doc.addImage(v.inCameraImage, 'JPEG', data.cell.x + 1, y, data.cell.width - 2, 8);
              y += 9;
            }
            if (v?.inCameraFrameImage) {
              doc.addImage(v.inCameraFrameImage, 'JPEG', data.cell.x + 1, y, data.cell.width - 2, 8);
            }
          }

          if (data.section === 'body' && data.column.index === 8) {
            let y = data.cell.y + 1;
            if (v?.outCameraImage) {
              doc.addImage(v.outCameraImage, 'JPEG', data.cell.x + 1, y, data.cell.width - 2, 8);
              y += 9;
            }
            if (v?.outCameraFrameImage) {
              doc.addImage(v.outCameraFrameImage, 'JPEG', data.cell.x + 1, y, data.cell.width - 2, 8);
            }
          }
        },
        didDrawPage: () => {
          doc.text('© IDS ID SMART TECH', 10, pageHeight - 10);
          doc.text(
            `Page ${doc.getCurrentPageInfo().pageNumber} of ${doc.getNumberOfPages()}`,
            pageWidth / 2, pageHeight - 10, { align: 'center' }
          );
        }
      });

      doc.save('VehicleInOutRegister.pdf');
    };
  }

  /* ─── EXCEL EXPORT ───────────────────────────────────────────── */
  exportExcel() {
    if (this.filteredData.length === 0) return;

    const printedOn = new Date().toLocaleString('en-GB');

    const excelData = this.filteredData.map((v, i) => ({
      'SR NO':    i + 1,
      'VEHICLE':  v.vehicleNumber,
      'OWNER':    v.ownerName,
      'BUILDING': v.building,
      'FLAT':     v.flatNumber,
      'IN TIME':  v.inTime  ? DateTimeUtil.formatDateTime(v.inTime)  : '',
      'OUT TIME': v.outTime ? DateTimeUtil.formatDateTime(v.outTime) : '',
    }));

    const wb: any     = XLSX.utils.book_new();
    const wsData: any[] = [
      ["VEHICLE IN - OUT - Register REPORT", "", "", "", "", "", "", "Printed: " + printedOn],
      [],
      Object.keys(excelData[0])
    ];

    excelData.forEach(row => wsData.push(Object.values(row)));
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["A1"].s = { font: { bold: true, sz: 20 }, alignment: { horizontal: "center" } };
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
    const printedCell = XLSX.utils.encode_cell({ r: 0, c: 7 });
    ws[printedCell].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: "right" } };

    const headers = Object.keys(excelData[0]);
    headers.forEach((h, colIndex) => {
      const cell = XLSX.utils.encode_cell({ r: 2, c: colIndex });
      ws[cell].s = {
        font:      { bold: true, color: { rgb: "000000" }, sz: 12 },
        fill:      { fgColor: { rgb: "DDEBF7" } },
        alignment: { horizontal: "center" },
        border:    { top: { style: "thin" }, bottom: { style: "thin" }, left: { style: "thin" }, right: { style: "thin" } }
      };
    });

    ws["!cols"] = headers.map(h => ({ wch: h.length + 15 }));
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicle In-Out Register Report');

    const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([buffer]), 'VehicleInOutReport.xlsx');
  }
}