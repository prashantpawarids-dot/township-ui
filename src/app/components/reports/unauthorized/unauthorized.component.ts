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
// import { LoaderService } from 'src/app/_core/shared/utils/loader.service';
import { LoaderService } from 'src/app/_core/shared/utils/loader.service';
import { AuthService } from 'src/app/services/auth.service';

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
  // selectedVehicleImage: string = '';
    selectedVehicleImage: string = '';
  selectedPlateImage: string = '';
  imageLoading: boolean = false;
  imageSyncing: boolean = false;
  private prevInOut: string[] = [];

openVehiclePopup(d: any, type: 'in' | 'out') {
    this.selectedVehicle = d;
  this.selectedPlateImage = '';
  this.selectedVehicleImage = '';
  this.imageSyncing = false;

  const uniqueId = type === 'out' ? d.outUniqueId : d.inUniqueId;

  // Koi unique_id hi nahi hai — matlab image link kabhi bana hi nahi
  if (!uniqueId) {
    this.imageLoading = false;
    this.imageSyncing = true;
    return;
  }

  this.imageLoading = true;

  // this.http.get<any>(`${environment.apiurl}Report/VehicleImage/${uniqueId}`).subscribe({
    this.authService.getVehicleImage(uniqueId).subscribe({
    next: (res) => {
      this.imageLoading = false;
      // if (res?.image) {
            if (res?.frameImage) {

                      this.selectedVehicleImage = res.frameImage;
        this.selectedPlateImage = res?.plateImage || '';
        this.imageSyncing = false;
      } else {
        this.imageSyncing = true;
      }
    },
    error: () => {
      // Image abhi tak camera se sync nahi hui, ya permanently missing
      this.imageLoading = false;
      this.imageSyncing = true;
    }
  });
}

    closeVehiclePopup() {
    // this.selectedVehicle = null;
        this.selectedVehicle = null;
    this.selectedPlateImage = '';
    this.selectedVehicleImage = '';
    this.imageLoading = false;
    this.imageSyncing = false;
  }

  getVehicleIcon(vehicleTypeLabel: string): string {
    const type = (vehicleTypeLabel || '').toLowerCase();
    if (type.includes('two')) {
      return 'two_wheeler';
    }
    if (type.includes('three') || type.includes('auto') || type.includes('rickshaw')) {
      return 'electric_rickshaw';
    }
    return 'directions_car'; // Four Wheeler / Unknown
  }

  // IN/OUT filter options — no "ALL" toggle needed, kept simple with ALL option
  // inOutOptions = [
  //   { value: 'ALL', label: 'ALL' },
  //   { value: 'IN',  label: 'IN'  },
  //   { value: 'OUT', label: 'OUT' }
  // ];


    inOutOptions = [
    { value: 'ALL', label: 'ALL' },
    { value: 'IN',  label: 'IN'  },
    { value: 'OUT', label: 'OUT' }
  ];

  neighbourhoodOptions = [
    { value: 'ALL',           label: 'All' },
    { value: 'Falcon Towers', label: 'Falcon Towers' },
    { value: 'Skylark',       label: 'Skylark' }
  ];

   private currentFromDate: Date | null = null;
  private currentToDate: Date | null = null;
  private currentSearchValue: string = '';
  private currentNeighbourhood: string = 'ALL';
   private currentInOut: string[] = [];
   private currentExitStatus: string = 'ALL';

  exitStatusOptions = [
    { value: 'ALL',        label: 'All' },
        { value: 'NOT_EXITED', label: 'Not Exited' },
        { value: 'EXITED',     label: 'Exited' },
    { value: 'EXIT_ONLY',  label: 'Exit only (no entry)' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private sortService: TableSortService,
     private loaderService: LoaderService,
    private authService: AuthService
  ) {
    const today = new Date();
        this.reportForm = this.fb.group({
      fromDate:      [today],
      toDate:        [today],
      inOut:         [[]],
            searchValue:   [''],
      neighbourhood: ['ALL'],
      exitStatus:    ['ALL']
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

  



// totalCount = 0;

// loadVehicleData(fromDate?: Date, toDate?: Date, pageNumber = 1, pageSize = 25, searchVehicle = '', onLoaded?: (data: any[]) => void) {
//   const from = fromDate || new Date();
//   const to   = toDate   || new Date();

//   const formatDate = (d: Date) => {
//     const day   = String(d.getDate()).padStart(2, '0');
//     const month = d.toLocaleString('en-US', { month: 'short' });
//     const year  = d.getFullYear();
//     return `${day} ${month} ${year}`;
//   };

//   const apiUrl =
//     `${environment.apiurl}Report/UnAuthorisedVehicleInoutRegister` +
//     `?fromDateTime=${encodeURIComponent(formatDate(from))}` +
//     `&toDateTime=${encodeURIComponent(formatDate(to))}` +
//     `&pageNumber=${pageNumber}` +
//     `&pageSize=${pageSize}` +
//     `&searchVehicle=${encodeURIComponent(searchVehicle)}`;

//   this.loaderService.show();

//   this.http.get<any>(apiUrl).subscribe({
//     next: (res) => {
//       const data = res?.data ?? [];
//       this.totalCount = res?.totalCount ?? 0;

//       this.vehicleData = data.map((v: any) => ({
//         id:                v.id || v.vehicleNumber || '',
//         vehicleNumber:     v.vehicleNumber     || '',
//         tagUID:            v.tagUID            || '',
//         idNumber:          v.idNumber          || '',
//         ownerName:         v.ownerName         || '',
//         building:          v.building          || '',
//         cardType:          v.cardType          || '',
//         flatNumber:        v.flatNumber        || '',
//         inCameraLocation:  v.inCameraLocation  || '',
//         outCameraLocation: v.outCameraLocation || '',
//         inTime:            v.inTime            || '',
//         outTime:           v.outTime           || '',
//         inoutFlag:         v.outTime && !v.inTime ? 'OUT' : 'IN',
//         inCameraImageRaw:  v.inCameraImage     || '',
//         outCameraImageRaw: v.outCameraImage    || '',
//         numberPlateImage:  this.generatePlateImg(v.vehicleNumber || 'UNKNOWN'),
//         inCameraImage:     '',
//         outCameraImage:    ''
//       }));

//       this.filteredData       = this.vehicleData;
//       this.displayedData.data = this.vehicleData;
//       this.paginator.length   = this.totalCount;
//       this.pagedData          = this.vehicleData;

//       if (onLoaded) onLoaded(this.vehicleData);
//       this.loaderService.hide();
//     },
//     error: (err) => {
//       console.error('❌ API ERROR (Unauthorized):', err);
//       this.loaderService.hide();
//     }
//   });
// }


// loadVehicleData(fromDate?: Date, toDate?: Date, pageNumber = 1, pageSize = 25, searchVehicle = '', onLoaded?: (data: any[]) => void) {
//   const from = fromDate || new Date();
//   const to   = toDate   || new Date();

loadVehicleData(fromDate?: Date, toDate?: Date, pageNumber = 1, pageSize = 25, searchVehicle = '', neighbourhood = 'ALL', onLoaded?: (data: any[]) => void) {
  const from = fromDate || new Date();
  const to   = toDate   || new Date();

  const formatDate = (d: Date) => {
    const day   = String(d.getDate()).padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year  = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  


    // const apiUrl =
    // `${environment.apiurl}Report/UnAuthorisedVehicleInoutRegister` +
    // `?fromDateTime=${encodeURIComponent(formatDate(from))}` +
    // `&toDateTime=${encodeURIComponent(formatDate(to))}` +
    // `&pageNumber=${pageNumber}&pageSize=${pageSize}` +
    // `&searchVehicle=${encodeURIComponent(searchVehicle)}`;


                const apiUrl =
    `${environment.apiurl}Report/UnAuthorisedVehicleInoutRegister` +
    `?fromDateTime=${encodeURIComponent(formatDate(from))}` +
    `&toDateTime=${encodeURIComponent(formatDate(to))}` +
    `&pageNumber=${pageNumber}&pageSize=${pageSize}` +
    `&searchVehicle=${encodeURIComponent(searchVehicle)}` +
    `&neighbourhood=${encodeURIComponent(neighbourhood === 'ALL' ? '' : neighbourhood)}` +
        `&inOut=${encodeURIComponent(this.currentInOut.join(','))}` +
        `&exitStatus=${this.currentExitStatus}`;
  this.loaderService.show();

  this.http.get<any>(apiUrl).subscribe({
    next: (res) => {
      const data = res?.data ?? [];

         let mapped = data.map((v: any) => ({
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
    inoutFlag:         v.outTime ? 'OUT' : 'IN',
          inUniqueId:        v.inUniqueId  || '',
    outUniqueId:       v.outUniqueId || '',
  vehicleTypeLabel:  v.vehicleTypeLabel || 'Four Wheeler',
    numberPlateImage:  this.generatePlateImg(v.vehicleNumber || 'UNKNOWN'),
    inCameraImage:     '',
    outCameraImage:    ''
  }));

           // ── IN/OUT aur Neighbourhood ab backend (SQL) mein filter ho rahe hain,
      //    isliye yahan client-side filtering ki zaroorat nahi — mapped as-is use hoga.

      
      this.sortService.setSortColumn('inTime', 'asc');
      const sortedMapped = this.sortService.sortData([...mapped], 'inTime');

      this.totalCount    = res?.totalCount ?? sortedMapped.length;
      this.pagedData      = sortedMapped;
      this.vehicleData    = sortedMapped;
      this.displayedData.data = sortedMapped;
      if (this.paginator) this.paginator.length = this.totalCount;

      if (onLoaded) onLoaded(this.pagedData);
      this.loaderService.hide();
    },
    error: (err) => {
      console.error('❌ API ERROR (Unauthorized):', err);
      this.loaderService.hide();
    }
  });
}

totalCount = 0;



  fixDateFormat(dateStr: string): Date {
    if (!dateStr) return new Date('');
    if (/T\d{2}:\d{2}:\d{2}\.\d{2}$/.test(dateStr)) dateStr = dateStr + '0';
    return new Date(dateStr);
  }

 

showReports() {
  const { fromDate, toDate, searchValue, neighbourhood, inOut, exitStatus } = this.reportForm.value;

  this.currentFromDate      = fromDate ? new Date(fromDate) : new Date();
  this.currentToDate        = toDate   ? new Date(toDate)   : new Date();
  this.currentSearchValue   = searchValue || '';
  this.currentNeighbourhood = neighbourhood || 'ALL';
  this.currentInOut         = (inOut || []).filter((v: string) => v !== 'ALL');
    this.currentExitStatus    = exitStatus || 'ALL';

  if (this.paginator) this.paginator.pageIndex = 0;

  this.loadVehicleData(
    this.currentFromDate,
    this.currentToDate,
    1,
    this.paginator.pageSize,
    this.currentSearchValue,
    this.currentNeighbourhood
  );
}
  showAll() {
    this.reportForm.reset({
            fromDate:    '',
            exitStatus:  'ALL',
      toDate:      '',
      inOut:       [],
      searchValue: '',
      neighbourhood: 'ALL'
    }, { emitEvent: false });

    this.displayedData.data = [];
    this.filteredData       = [];
    this.pagedData          = [];
    this.prevInOut = [];

    if (this.paginator) this.paginator.firstPage();
    this.updatePagination();
  }




All() {
  this.reportForm.reset({
       fromDate:      null,
    exitStatus:    'ALL',
    toDate:        null,
    inOut:         [],
    searchValue:   '',
    neighbourhood: 'ALL'
  }, { emitEvent: false });

  this.prevInOut = [];

  this.currentFromDate      = new Date('2000-01-01');
  this.currentToDate        = new Date('2099-12-31');
  this.currentSearchValue   = '';
  this.currentNeighbourhood = 'ALL';
    this.currentInOut         = [];
   this.currentExitStatus    = 'ALL';
  if (this.paginator) this.paginator.pageIndex = 0;

  this.loadVehicleData(
    this.currentFromDate,
    this.currentToDate,
    1,
    this.paginator.pageSize,
    this.currentSearchValue,
    this.currentNeighbourhood
  );
}
// onPageChange(event: any) {
//   const start = event.pageIndex * event.pageSize;
//   this.pagedData          = this.filteredData.slice(start, start + event.pageSize);
//   this.vehicleData        = this.pagedData;
//   this.displayedData.data = this.pagedData;
// }


onPageChange(event: any) {
  this.loadVehicleData(
    this.currentFromDate || new Date(),
    this.currentToDate   || new Date(),
    event.pageIndex + 1,
    event.pageSize,
    this.currentSearchValue,
    this.currentNeighbourhood
  );
}
  // updatePagination() {
  //   if (!this.paginator) return;

  //   this.paginator.length = this.displayedData.data.length;

  //   const start = this.paginator.pageIndex * this.paginator.pageSize;
  //   const end   = start + this.paginator.pageSize;

  //   this.pagedData = this.displayedData.data.slice(start, end);
  // }

 updatePagination() {
  if (!this.paginator) return;
  this.paginator.length = this.totalCount;
  this.pagedData = this.displayedData.data;
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

//   private fetchExportData(callback: (data: any[]) => void) {
//   const { fromDate, toDate, searchValue } = this.reportForm.value;

//   const from = fromDate ? new Date(fromDate) : new Date();
//   const to   = toDate   ? new Date(toDate)   : new Date();

//   const formatDate = (d: Date) => {
//     const day   = String(d.getDate()).padStart(2, '0');
//     const month = d.toLocaleString('en-US', { month: 'short' });
//     const year  = d.getFullYear();
//     return `${day} ${month} ${year}`;
//   };

//   const apiUrl =
//     `${environment.apiurl}Report/UnAuthorisedVehicleInoutRegister` +
//     `?fromDateTime=${encodeURIComponent(formatDate(from))}` +
//     `&toDateTime=${encodeURIComponent(formatDate(to))}` +
//     `&pageNumber=1&pageSize=100000` +
//     `&searchVehicle=${encodeURIComponent(searchValue || '')}`;

//   this.loaderService.show();

//   this.http.get<any>(apiUrl).subscribe({
//     next: (res) => {
//       const data = res?.data ?? [];
//       const mapped = data.map((v: any) => ({
//         id:                v.id || v.vehicleNumber || '',
//         vehicleNumber:     v.vehicleNumber     || '',
//         tagUID:            v.tagUID            || '',
//         idNumber:          v.idNumber          || '',
//         ownerName:         v.ownerName         || '',
//         building:          v.building          || '',
//         cardType:          v.cardType          || '',
//         flatNumber:        v.flatNumber        || '',
//         inCameraLocation:  v.inCameraLocation  || '',
//         outCameraLocation: v.outCameraLocation || '',
//         inTime:            v.inTime            || '',
//         outTime:           v.outTime           || '',
//         inoutFlag:         v.outTime && !v.inTime ? 'OUT' : 'IN',
//         numberPlateImage:  this.generatePlateImg(v.vehicleNumber || 'UNKNOWN')
//       }));
//       this.loaderService.hide();
//       callback(mapped);
//     },
//     error: (err) => {
//       console.error('❌ Export fetch error:', err);
//       this.loaderService.hide();
//     }
//   });
// }

//   exportPDF() {
//     const data = this.filteredData;
//     if (!data.length) return;

//     const doc  = new jsPDF('l', 'mm', 'a4');
//     const logo = new Image();
//     logo.src   = 'assets/images/logo/logo.jpeg';

//     logo.onload = () => {
//       const pageWidth  = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();

//       doc.addImage(logo, 'JPEG', 10, 10, 25, 25);

//       const now = new Date();
//       doc.setFontSize(9);
//       doc.text(
//         `Printed On: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
//         pageWidth - 10, 20, { align: 'right' }
//       );

//       doc.setFontSize(18);
//       doc.setFont(undefined, 'bold');
//       doc.text('UNAUTHORIZED VEHICLE REPORT', pageWidth / 2, 20, { align: 'center' });
//       doc.setFont(undefined, 'normal');

//   const dates = data
//         .map(d => new Date(d.inTime))
//         .filter(d => !isNaN(d.getTime()));

//       if (dates.length) {
//         const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
//         const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
//         doc.setFontSize(10);
//         doc.text(
//           `From: ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}`,
//           pageWidth / 2, 30, { align: 'center' }
//         );
//       }

//       autoTable(doc, {
//         startY: 40,
//         styles: { minCellHeight: 14 },
//         head: [[
//           'Sr No', 'Vehicle No', 'Tag UID', 'Name',
//            'IN Location', 'OUT Location', 'IN Time', 'OUT Time', 'Image'
//         ]],
//        body: data.map((v, i) => [
//           i + 1,
//           v.vehicleNumber,
//           v.tagUID,
//           v.ownerName,
         
//           v.inCameraLocation,
//           v.outCameraLocation,
//           v.inTime  ? new Date(v.inTime).toLocaleString()  : '',
//           v.outTime ? new Date(v.outTime).toLocaleString() : '',
//           ''
//         ]),
//         columnStyles: { 11: { cellWidth: 38 } },
//         headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
//         theme: 'grid',
//         bodyStyles: { fontSize: 9, textColor: [0, 0, 0], fontStyle: 'normal' },
//         didDrawCell: (cellData: any) => {
//           if (cellData.section === 'body' && cellData.column.index === 11) {
//             const v = data[cellData.row.index];
//            if (v?.numberPlateImage) {
//               doc.addImage(
//                 v.numberPlateImage, 'PNG',
//                 cellData.cell.x + 1, cellData.cell.y + 1,
//                 cellData.cell.width - 2, cellData.cell.height - 2
//               );
//             }
//           }
//         },
//         didDrawPage: (pageData: any) => {
//           const currentPage = pageData.pageNumber;
//           const pageCount   = (doc as any).internal.pages.length - 1;
//           doc.setFontSize(9);
//           doc.text(`Page ${currentPage} of ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
//           doc.text('©IDS ID Smart Tech', 10, pageHeight - 10);
//         }
//       });

//     doc.save('UnauthorizedVehicleReport.pdf');
//     };
//   }

// exportExcel() {
//     const data = this.filteredData;
//     if (!data.length) return;

//     const f         = this.reportForm.value;
//     const from      = f.fromDate ? new Date(f.fromDate).toLocaleDateString() : null;
//     const to        = f.toDate   ? new Date(f.toDate).toLocaleDateString()   : null;
//     const generated = new Date().toLocaleString();

//     const workbook  = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet('UnauthorizedVehicle');

//     // ── Heading row ───────────────────────────────────────────────────────────
//     worksheet.mergeCells('A1:L1');
//     const headingCell     = worksheet.getCell('A1');
//     headingCell.value     = 'UNAUTHORIZED VEHICLE REPORT';
//     headingCell.font      = { bold: true, size: 18 };
//     headingCell.alignment = { horizontal: 'center' };

//     let currentRow = 2;

//     if (from && to) {
//       worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
//       const dateCell     = worksheet.getCell(`A${currentRow}`);
//       dateCell.value     = `from: ${from} to ${to}`;
//       dateCell.alignment = { horizontal: 'center' };
//       currentRow++;
//     }

//     currentRow++; // blank spacer row

//     // ── Column header row ─────────────────────────────────────────────────────
//     // ── Column header row ─────────────────────────────────────────────────────
//     const headerRow = worksheet.addRow([
//       'SR NO', 'VEHICLE NUMBER', 'TAG UID', 'NAME',  'IN LOCATION', 'OUT LOCATION', 'IN TIME', 'OUT TIME', 'NUMBER PLATE'
//     ]);
//     headerRow.font      = { bold: true, size: 12 };
//     headerRow.alignment = { horizontal: 'center' };
//     headerRow.eachCell((cell) => {
//       cell.fill   = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } };
//       cell.border = {
//         top:    { style: 'thin', color: { argb: '000000' } },
//         left:   { style: 'thin', color: { argb: '000000' } },
//         right:  { style: 'thin', color: { argb: '000000' } },
//         bottom: { style: 'thin', color: { argb: '000000' } }
//       };
//     });

//     currentRow++;

//     // ── Data rows ─────────────────────────────────────────────────────────────
//    // ── Data rows ─────────────────────────────────────────────────────────────
//    data.forEach((v, i) => {
//       const inFormatted  = DateTimeUtil.formatDateTime(v.inTime);
//       const outFormatted = v.outTime ? DateTimeUtil.formatDateTime(v.outTime) : '';

//       const row = worksheet.addRow([
//         i + 1,
//         v.vehicleNumber,
//         v.tagUID,
//         v.ownerName,
       
//         v.inCameraLocation,
//         v.outCameraLocation,
//         inFormatted,
//         outFormatted,
//         ''
//       ]);

//       row.height = 38;

//       // ── Only embed image if it is real base64 data ────────────────────────
//       if (v.numberPlateImage && v.numberPlateImage.startsWith('data:image')) {
//         const imgId = workbook.addImage({
//           base64:    v.numberPlateImage.split(',')[1],
//           extension: 'png'
//         });
//         worksheet.addImage(imgId, {
//           tl:     { col: 11, row: row.number - 1 },
//           br:     { col: 12, row: row.number },
//           editAs: 'oneCell'
//         } as any);
//       }
//     });

//     // ── Footer: printed on ────────────────────────────────────────────────────
//     currentRow = worksheet.lastRow!.number + 1;
//     worksheet.mergeCells(`A${currentRow}:L${currentRow}`);
//     const genCell     = worksheet.getCell(`A${currentRow}`);
//     genCell.value     = `printed on: ${generated}`;
//     genCell.alignment = { horizontal: 'center' };

//     worksheet.columns.forEach(col => { col.width = 20; });

//   workbook.xlsx.writeBuffer().then(buffer => {
//       saveAs(new Blob([buffer]), 'UnauthorizedVehicleReport.xlsx');
//     });
//   }



  // ── Export: API se saara filtered data (page nahi) ──────────────────────────
  private fetchExportData(callback: (data: any[]) => void) {
    const from = this.currentFromDate || new Date();
    const to   = this.currentToDate   || new Date();

    const formatDate = (d: Date) => {
      const day   = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('en-US', { month: 'short' });
      const year  = d.getFullYear();
      return `${day} ${month} ${year}`;
    };

    const apiUrl =
      `${environment.apiurl}Report/UnAuthorisedVehicleInoutRegister` +
      `?fromDateTime=${encodeURIComponent(formatDate(from))}` +
      `&toDateTime=${encodeURIComponent(formatDate(to))}` +
      `&pageNumber=1&pageSize=1000000` +
      `&searchVehicle=${encodeURIComponent(this.currentSearchValue)}` +
      `&neighbourhood=${encodeURIComponent(this.currentNeighbourhood === 'ALL' ? '' : this.currentNeighbourhood)}` +
      `&inOut=${encodeURIComponent(this.currentInOut.join(','))}` +
      `&exitStatus=${this.currentExitStatus}`;

    this.loaderService.show();

    this.http.get<any>(apiUrl).subscribe({
      next: (res) => {
        const data = res?.data ?? [];
        const mapped = data.map((v: any) => ({
          vehicleNumber:     v.vehicleNumber     || '',
          tagUID:            v.tagUID            || '',
          ownerName:         v.ownerName         || '',
          inCameraLocation:  v.inCameraLocation  || '',
          outCameraLocation: v.outCameraLocation || '',
          inTime:            v.inTime            || '',
          outTime:           v.outTime           || ''
        }));
        this.loaderService.hide();
        callback(mapped);
      },
      error: (err) => {
        console.error('❌ Export fetch error:', err);
        this.loaderService.hide();
      }
    });
  }

  private getRangeText(): string {
    const f = this.currentFromDate;
    const t = this.currentToDate;
    if (!f || !t || f.getFullYear() <= 2000) return 'All Dates';
    return `${f.toLocaleDateString()} to ${t.toLocaleDateString()}`;
  }

  private getExitStatusText(): string {
    if (this.currentExitStatus === 'NOT_EXITED') return 'Not Exited';
        if (this.currentExitStatus === 'EXITED')     return 'Exited';
    if (this.currentExitStatus === 'EXIT_ONLY')  return 'Exit only (no entry)';
    return 'All';
  }

  exportPDF() {
    this.fetchExportData((data) => {
      if (!data.length) return;

      const logo = new Image();
      logo.onload  = () => this.buildPdf(data, logo);
      logo.onerror = () => this.buildPdf(data, null);   // logo na mile tab bhi PDF bane
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
    doc.text('UNAUTHORIZED VEHICLE REPORT', pageWidth / 2, 20, { align: 'center' });
    doc.setFont(undefined as any, 'normal');

    doc.setFontSize(10);
    doc.text(`Date: ${this.getRangeText()}   |   Exit Status: ${this.getExitStatusText()}`,
      pageWidth / 2, 30, { align: 'center' });

    autoTable(doc, {
      startY: 40,
      head: [['Sr No', 'Vehicle No', 'Tag UID', 'Name',
              'IN Location', 'OUT Location', 'IN Time', 'OUT Time']],
      body: data.map((v, i) => [
        i + 1,
        v.vehicleNumber,
        v.tagUID,
        v.ownerName,
        v.inCameraLocation,
        v.outCameraLocation,
        v.inTime  ? new Date(v.inTime).toLocaleString()  : '',
        v.outTime ? new Date(v.outTime).toLocaleString() : ''
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

    doc.save('UnauthorizedVehicleReport.pdf');
  }

  exportExcel() {
    this.fetchExportData((data) => {
      if (!data.length) return;

      const generated = new Date().toLocaleString();
      const workbook  = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('UnauthorizedVehicle');

      worksheet.mergeCells('A1:H1');
      const headingCell     = worksheet.getCell('A1');
      headingCell.value     = 'UNAUTHORIZED VEHICLE REPORT';
      headingCell.font      = { bold: true, size: 18 };
      headingCell.alignment = { horizontal: 'center' };

      worksheet.mergeCells('A2:H2');
      const infoCell     = worksheet.getCell('A2');
      infoCell.value     = `Date: ${this.getRangeText()}   |   Exit Status: ${this.getExitStatusText()}`;
      infoCell.alignment = { horizontal: 'center' };

      worksheet.addRow([]);

      const headerRow = worksheet.addRow([
        'SR NO', 'VEHICLE NUMBER', 'TAG UID', 'NAME',
        'IN LOCATION', 'OUT LOCATION', 'IN TIME', 'OUT TIME'
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
          v.vehicleNumber,
          v.tagUID,
          v.ownerName,
          v.inCameraLocation,
          v.outCameraLocation,
          v.inTime  ? DateTimeUtil.formatDateTime(v.inTime)  : '',
          v.outTime ? DateTimeUtil.formatDateTime(v.outTime) : ''
        ]);
      });

      const footerRow = worksheet.lastRow!.number + 2;
      worksheet.mergeCells(`A${footerRow}:H${footerRow}`);
      const genCell     = worksheet.getCell(`A${footerRow}`);
      genCell.value     = `printed on: ${generated}`;
      genCell.alignment = { horizontal: 'center' };

      worksheet.columns.forEach(col => { col.width = 22; });

      workbook.xlsx.writeBuffer().then(buffer => {
        saveAs(new Blob([buffer]), 'UnauthorizedVehicleReport.xlsx');
      });
    });
  }

}