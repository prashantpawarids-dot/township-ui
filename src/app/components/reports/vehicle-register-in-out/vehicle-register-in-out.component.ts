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
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { sortByTimeOnly } from 'src/app/_core/shared/utils/sort.util';
import { DateTimeUtil } from 'src/app/_core/shared/utils/datetime.util';
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
    HttpClientModule
  ],
  templateUrl: './vehicle-register-in-out.component.html',
  styleUrls: ['../../../../table.css']
})
export class VehicleRegisterInOutComponent implements OnInit, AfterViewInit {

  reportForm: FormGroup;
  vehicleData: any[] = [];
  displayedData = new MatTableDataSource<any>([]);
  pageSizes = [10, 25, 50, 100, 150, 200];
  buildings: string[] = [];  // For mat-select options
allBuildings: string[] = []; // Full list if needed for filtering
filteredData: any[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

 

  searchType = [
    { value: 'vehicleNumber', label: 'Vehicle Number' },
    { value: 'ownerName', label: 'Owner Name' },
    // { value: 'building', label: 'Building' },
    { value: 'flatNumber', label: 'Flat Number' }
  ];

  displayColumns = [
    'srNo', 'vehicleNumber', 'ownerName', 'building', 'flatNumber',
    'inCameraImage', 'outCameraImage', 'inTime', 'outTime'
  ];

  constructor(private fb: FormBuilder, private http: HttpClient ,private sortService: TableSortService) {
    let today=new Date();
    this.reportForm = this.fb.group({
  fromDate: [today],
  fromTime: [''],   // <-- new
  toDate: [today],
  toTime: [''],     // <-- new
  buildings: [[]],
  searchType: [''],
  searchValue: ['']
});

  }

 ngOnInit() {
  this.loadVehicleData();
this.loadBuildingList(); // << Add this
  
}


  ngAfterViewInit() {
    this.displayedData.paginator = this.paginator;
  }
get paginatedData() {
  if (!this.paginator) return this.displayedData.data;
  const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
  return this.displayedData.data.slice(startIndex, startIndex + this.paginator.pageSize);
}

  loadVehicleData() {
  const apiUrl = `${environment.apiurl}Report/vehicleInoutRegister`;

  this.http.get<any[]>(apiUrl).subscribe({
    next: (data) => {
      if (Array.isArray(data)) {
        this.vehicleData = data.map(v => ({
          vehicleNumber: v.vehicleNumber,
          ownerName: v.ownerName,
          building: v.building,
          flatNumber: v.flatNumber,
          inCameraImage: v.inCameraImage,
          outCameraImage: v.outCameraImage,
          inTime: v.inTime,
          outTime: v.outTime
        }));

        

        // **Do NOT fill displayedData on load** → show only headers
        this.displayedData.data = [];
      }
    },
    error: (err) => console.error('Error fetching data:', err)
  });
}


loadBuildingList() {
  this.http.get<any[]>(`${environment.apiurl}Building`).subscribe(res => {
    this.allBuildings = res.map(b => b.name);
    this.buildings = ['All', ...this.allBuildings]; // Add 'All' at the top
  }, err => console.error('Error fetching buildings:', err));
}
onBuildingChange() {
  const selected = this.reportForm.value.buildings;

  if (selected.includes('All')) {
    this.reportForm.patchValue({
      buildings: [...this.allBuildings]   // Use master list ONLY
    });
  }
}



public sortColumn(column: string) {
  // Exclude sorting for 'srNo' column
  if (column === 'srNo') {
    return;
  }

  // Toggle sorting direction for other columns
  if (this.sortService.getSortColumn() === column) {
    this.sortService.toggleDirection();
  } else {
    this.sortService.setSortColumn(column, 'asc');
  }

  // Get the current sort direction
  const direction = this.sortService.getSortDirection();

  // Sort the data based on the selected column
  this.displayedData.data = this.sortService.sortData([...this.displayedData.data], column);

  // Reset paginator to the first page
  this.paginator.firstPage();
}



  // Getter methods for sorting
  getSortColumn(): string {
    return this.sortService.getSortColumn();
  }

  getSortDirection(): 'asc' | 'desc' {
    return this.sortService.getSortDirection();
  }


  clear() {
  this.reportForm.reset({
    buildings: [],   // EMPTY (no auto-select)
    searchType: '',
    searchValue: '',
    fromDate: '',
    toDate: ''
  });

  // Clear table (do NOT auto-load all vehicleData)
  this.displayedData.data = [];

  if (this.paginator) this.paginator.firstPage();
}




  showReports() {
  this.applyFilters(); // Apply filters and display filtered data
}

//   private applyFilters() {
//   let result = [...this.vehicleData];

//   const from = this.reportForm.get('fromDate')?.value;
//   const to = this.reportForm.get('toDate')?.value;
//   const buildings = this.reportForm.get('buildings')?.value || [];
//   const searchType = this.reportForm.get('searchType')?.value;
//   const searchValue = (this.reportForm.get('searchValue')?.value || '').toString().trim().toLowerCase();

//    // DATE FILTER
//   if (from) result = result.filter(v => new Date(v.inTime) >= new Date(from));
//   if (to) {
//     const t = new Date(to);
//     t.setHours(23, 59, 59, 999);
//     result = result.filter(v => new Date(v.inTime) <= t);
//   }

//   if (buildings.length > 0 && !buildings.includes('All')) {
//   result = result.filter(v => buildings.includes(v.building));
// }


//    if (searchValue.length > 0) {
//     if (!searchType) {
//       alert('Please select a search type'); // ⚠ alert user
//       this.displayedData.data = [];       // ⚠ clear table
//       return;                              // ⚠ stop further execution
//     }

//     result = result.filter(v =>
//       (v[searchType] || '').toString().toLowerCase().startsWith(searchValue) // ✅ startsWith instead of includes
//     );
//   }
// result = sortByTimeOnly(result, 'inTime', 'asc'); 
//  this.filteredData = result;

//   this.displayedData.data = result;

//   if (this.paginator) this.paginator.firstPage();
// }
private applyFilters() {
  let result = [...this.vehicleData];

  const fromDate = this.reportForm.get('fromDate')?.value;
  const fromTime = this.reportForm.get('fromTime')?.value;
  const toDate = this.reportForm.get('toDate')?.value;
  const toTime = this.reportForm.get('toTime')?.value;
  const buildings = this.reportForm.get('buildings')?.value || [];
  const searchType = this.reportForm.get('searchType')?.value;
  const searchValue = (this.reportForm.get('searchValue')?.value || '').toString().trim().toLowerCase();

  // DATE & TIME FILTER
  if (fromDate) {
    const from = new Date(fromDate);
    if (fromTime) {
      const [h, m] = fromTime.split(':').map(Number);
      from.setHours(h, m, 0, 0);
    } else {
      from.setHours(0, 0, 0, 0);
    }
    result = result.filter(v => new Date(v.inTime) >= from);
  }

  if (toDate) {
    const to = new Date(toDate);
    if (toTime) {
      const [h, m] = toTime.split(':').map(Number);
      to.setHours(h, m, 59, 999);
    } else {
      to.setHours(23, 59, 59, 999);
    }
    result = result.filter(v => new Date(v.inTime) <= to);
  }

  // BUILDINGS FILTER
  if (buildings.length > 0 && !buildings.includes('All')) {
    result = result.filter(v => buildings.includes(v.building));
  }

  // SEARCH FILTER
  if (searchValue.length > 0) {
    if (!searchType) {
      alert('Please select a search type'); // ⚠ alert user
      this.displayedData.data = [];       // ⚠ clear table
      return;                              // ⚠ stop further execution
    }

    result = result.filter(v =>
      (v[searchType] || '').toString().toLowerCase().startsWith(searchValue) // ✅ startsWith instead of includes
    );
  }

  // SORT BY TIME
  result = sortByTimeOnly(result, 'inTime', 'asc'); 
  this.filteredData = result;

  // UPDATE TABLE
  this.displayedData.data = result;

  if (this.paginator) this.paginator.firstPage();
}



  /* -------------------------
      PDF EXPORT
  ------------------------- */
  exportReports() {
    if (this.filteredData.length === 0) return;


    const doc = new jsPDF('l', 'mm', 'a4');
    const logo = new Image();
    logo.src = 'assets/images/logo/logo.jpeg';
    const generatedOn = new Date().toLocaleString('en-GB');

    const validDates = this.filteredData
      .map(v => v.inTime ? new Date(v.inTime) : null)
      .filter(d => d !== null);

    const minDate = validDates.length ? new Date(Math.min(...validDates.map(d => d!.getTime()))) : null;
    const maxDate = validDates.length ? new Date(Math.max(...validDates.map(d => d!.getTime()))) : null;
    const formattedFrom = minDate ? minDate.toLocaleDateString('en-GB') : 'N/A';
    const formattedTo = maxDate ? maxDate.toLocaleDateString('en-GB') : 'N/A';

    logo.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
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
        // headStyles: { fillColor: [41, 128, 185], textColor: '#fff', halign: 'center', fontStyle: 'bold' },
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
        bodyStyles: {
    fontSize: 9,                 // ⬅ increase
    textColor: [0, 0, 0],         // ⬅ force black
    fontStyle: 'normal'
  },

        head: [['SR NO','VEHICLE','OWNER','BUILDING','FLAT','IN IMAGE','OUT IMAGE','IN TIME','OUT TIME']],
       body: this.filteredData.map((v, i) => [
        i+1, v.vehicleNumber, v.ownerName, v.building, v.flatNumber,
        v.inCameraImage || 'N/A', v.outCameraImage || 'N/A',
        v.inTime ? new Date(v.inTime).toLocaleString('en-GB') : '',
        v.outTime ? new Date(v.outTime).toLocaleString('en-GB') : ''
      ]),

        didDrawPage: () => {
          doc.text('© IDS ID SMART TECH', 10, pageHeight-10);
          doc.text(`Page ${doc.getCurrentPageInfo().pageNumber} of ${doc.getNumberOfPages()}`, pageWidth/2, pageHeight-10, { align: 'center' });
        }
      });

      doc.save('VehicleInOutRegister.pdf');
    };
  }

  /* -------------------------
      EXCEL EXPORT
  ------------------------- */
  exportExcel() {
    if (this.filteredData.length === 0) return;


    const printedOn = new Date().toLocaleString('en-GB');

const excelData = this.filteredData.map((v, i) => ({
  'SR NO': i + 1,
  'VEHICLE': v.vehicleNumber,
  'OWNER': v.ownerName,
  'BUILDING': v.building,
  'FLAT': v.flatNumber,
  'IN IMAGE': v.inCameraImage || 'N/A',
  'OUT IMAGE': v.outCameraImage || 'N/A',
'IN TIME': v.inTime ? DateTimeUtil.formatDateTime(v.inTime) : '',
'OUT TIME': v.outTime ? DateTimeUtil.formatDateTime(v.outTime) : '',

}));


    const wb = XLSX.utils.book_new();
    const wsData = [
      ["VEHICLE IN - OUT - Register REPORT","","","","","","","","Printed: "+printedOn],
      [],
      Object.keys(excelData[0])
    ];

    excelData.forEach(row => wsData.push(Object.values(row)));
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["A1"].s = { font: { bold:true, sz:20 }, alignment:{ horizontal:"center" } };
    ws["!merges"] = [{ s:{r:0,c:0}, e:{r:0,c:7} }];
    const printedCell = XLSX.utils.encode_cell({r:0,c:8});
    ws[printedCell].s = { font:{bold:true, sz:12}, alignment:{horizontal:"right"} };

    const headers = Object.keys(excelData[0]);
    headers.forEach((h, colIndex) => {
      const cell = XLSX.utils.encode_cell({r:2, c:colIndex});
      ws[cell].s = {
        font:{bold:true,color:{rgb:"000000"},sz:12},
        fill:{fgColor:{rgb:"DDEBF7"}},
        alignment:{horizontal:"center"},
        border:{ top:{style:"thin"}, bottom:{style:"thin"}, left:{style:"thin"}, right:{style:"thin"} }
      };
    });

    ws["!cols"] = headers.map(h=>({wch:h.length+15}));
    XLSX.utils.book_append_sheet(wb, ws, 'Vehicle In-Out Register Report');

    const buffer = XLSX.write(wb, { bookType:'xlsx', type:'array' });
    saveAs(new Blob([buffer]), 'VehicleInOutReport.xlsx');
  }

}
