




import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
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
    MatIconModule
  ],
  templateUrl: './vechile-in-out-log.component.html',
  styleUrls: ['../../../../table.css']
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


  constructor(private fb: FormBuilder, private http: HttpClient ,private sortService: TableSortService) {
    let today=new Date();
   this.reportForm = this.fb.group({
  fromDate: [today],
  fromTime: [''],     
  toDate: [today],
  toTime: [''],       
  vehicleType: [[]],
  inOut: [[]],
  searchBy: [''],
  searchValue: [''],
  project: [[]],
  building: [[]]
});

  }

  ngOnInit() {
    this.loadVehicleData();
    // this.loadProjectBuilding();

    this.displayedData.data = [];
    this.pagedData = [];
this.loadNRDList();       // NEW
  this.loadBuildingList();  // NEW
   
  }

  ngAfterViewInit() { }

  attachPaginatorSafely() {
    setTimeout(() => {
      if (this.paginator) {
        this.displayedData.paginator = this.paginator;
        this.updatePagination();
      }
    }, 0);
  }


 public sortColumn(column: string) {
  // Exclude sorting for 'srNo' column (we don’t need to sort it)
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
  const sortedData = this.sortService.sortData([...this.displayedData.data], column);

  // Update displayedData with sorted data
  this.displayedData.data = sortedData;

  // Reset paginator to the first page
  this.paginator.firstPage();
  this.updatePagination();
}
loadNRDList() {
  this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe(res => {
    this.neighbourhoods = res.map(n => n.name);   // simple string list
    this.projectList = [...this.neighbourhoods];  // your existing projectList uses same data
  });
}
loadBuildingList() {
  this.http.get<any[]>(`${environment.apiurl}Building`).subscribe(res => {
    this.allBuildings = res.map(b => ({
      name: b.name,
      nrdName: b.nrdName
    }));

    // For dropdown
    this.buildingList = [...new Set(this.allBuildings.map(b => b.name))];
  });
}


// Methods for template
getSortColumn(): string {
  return this.sortService.getSortColumn();
}

getSortDirection(): 'asc' | 'desc' {
  return this.sortService.getSortDirection();
}

  loadVehicleData() {
    const apiUrl = `${environment.apiurl}Report/vehicleInoutLog`;
    this.http.get<any[]>(apiUrl).subscribe({
      next: data => {
        this.vehicleData = Array.isArray(data) ? data.map(v => ({
          vehicleNumber: v.vehicleNumber || '',
          ownerName: v.ownerName || '',
          building: v.building || '',
          flatNumber: v.flatNumber || '',
          cardType: v.cardType || '',
          cameraLocation: v.cameraLocation || '',
          inoutFlag: v.inoutFlag || '',
          inoutTime: v.inoutTime || '',
          nrdName: v.nrd || '',
          vehicleCategory: v.vType || '',
          color: v.color || '',
          vehicleMake: v.vehicleMake || '',
          idNumber: v.idNumber || '',
          cameraImage: v.cameraImage || null,
          vMake: v.vMake || '',
        stickerNo: v.stickerNo || '',
        vColor: v.vColor || ''
        })) : [];
      },
      error: err => console.error("Error fetching vehicle data:", err)
    });
  }

 





  onProjectChange() {
  let selectedProjects: string[] = this.reportForm.get('project')?.value || [];

  if (selectedProjects.includes('ALL')) {
    selectedProjects = [...this.projectList];
    this.reportForm.get('project')?.setValue(selectedProjects);
  }

  // Filter buildings based on selected NRDs
  const filtered = this.allBuildings
    .filter(b => selectedProjects.includes(b.nrdName))
    .map(b => b.name);

  this.buildingList = [...new Set(filtered)];

  // Do NOT auto-select
}


  




onBuildingChange() {
  let selectedBuildings: string[] = this.reportForm.get('building')?.value || [];

  if (selectedBuildings.includes('ALL')) {
    selectedBuildings = [...this.buildingList];
    this.reportForm.get('building')?.setValue(selectedBuildings);
  }
}

onVehicleTypeChange() {
  let selected: string[] = this.reportForm.get('vehicleType')?.value || [];
  if (selected.includes('ALL')) {
    const allValues = this.vehicleTypes.filter(v => v.value !== 'ALL').map(v => v.value);
    this.reportForm.get('vehicleType')?.setValue(allValues);
  }
}

onInOutChange() {
  let selected: string[] = this.reportForm.get('inOut')?.value || [];
  if (selected.includes('ALL')) {
    const allValues = this.inOutOptions.filter(v => v.value !== 'ALL').map(v => v.value);
    this.reportForm.get('inOut')?.setValue(allValues);
  }
}



// ✅ Add selectAll here
  selectAll(type: 'project' | 'building') {
    if (type === 'project') {
      this.reportForm.get('project')?.setValue([...this.projectList]);
      this.onProjectChange();
    } else {
      this.reportForm.get('building')?.setValue([...this.buildingList]);
      this.onBuildingChange();
    }
  }

  fixDateFormat(dateStr: string): Date {
    if (!dateStr) return new Date('');
    if (/T\d{2}:\d{2}:\d{2}\.\d{2}$/.test(dateStr)) dateStr = dateStr + '0';
    return new Date(dateStr);
  }

  showReports() {
  const {
    fromDate,
    fromTime,   // ✅ ADDED
    toDate,
    toTime,     // ✅ ADDED
    vehicleType,
    inOut,
    searchBy,
    searchValue,
    project,
    building
  } = this.reportForm.value;

  let filtered = [...this.vehicleData];

  // -------- FROM DATE + TIME (ADDED TIME LOGIC ONLY) --------
  if (fromDate) {
    const from = new Date(fromDate);

    if (fromTime) {                     // ✅ ADDED
      const [h, m] = fromTime.split(':').map(Number);
      from.setHours(h, m, 0, 0);
    }

    filtered = filtered.filter(
      x => this.fixDateFormat(x.inoutTime).getTime() >= from.getTime()
    );
  }

  // -------- TO DATE + TIME (ADDED TIME LOGIC ONLY) --------
  if (toDate) {
    const to = new Date(toDate);

    if (toTime) {                       // ✅ ADDED
      const [h, m] = toTime.split(':').map(Number);
      to.setHours(h, m, 59, 999);
    } else {
      to.setHours(23, 59, 59, 999);     // 🔹 YOUR ORIGINAL LINE (UNCHANGED)
    }

    filtered = filtered.filter(
      x => this.fixDateFormat(x.inoutTime).getTime() <= to.getTime()
    );
  }

  // -------- REST OF YOUR CODE (UNCHANGED) --------
  if (project?.length) filtered = filtered.filter(x => project.includes(x.nrdName));
  if (building?.length) filtered = filtered.filter(x => building.includes(x.building));
  // if (vehicleType?.length) filtered = filtered.filter(x => vehicleType.includes((x.vehicleCategory || '').trim()));
  // if (inOut?.length) filtered = filtered.filter(x => inOut.includes((x.inoutFlag || '').toUpperCase()));

  if (vehicleType?.length && !vehicleType.includes('ALL')) 
  filtered = filtered.filter(x => vehicleType.includes((x.vehicleCategory || '').trim()));

if (inOut?.length && !inOut.includes('ALL')) 
  filtered = filtered.filter(x => inOut.includes((x.inoutFlag || '').toUpperCase()));

  if (searchValue?.trim() && !searchBy) {
    alert('Please select a search type');
    return;
  }

  if (searchValue) {
    const text = searchValue.toLowerCase();
    filtered = filtered.filter(x =>
      (x[searchBy] || '').toString().toLowerCase().startsWith(text)
    );
  }

  // 🔹 SORT BY TIME ONLY (UNCHANGED)
  filtered = sortByTimeOnly(filtered, 'inoutTime', 'asc');

  this.filteredData = filtered;
  this.displayedData.data = filtered;
  this.paginator.firstPage();
  this.updatePagination();
}



showAll() {
  // 🔹 Just clear all filter fields
  this.reportForm.reset({
    fromDate: '',
    toDate: '',
    vehicleType: [],
    inOut: [],
    searchBy: '',
    searchValue: '',
    project: [],
    building: []
  }, { emitEvent: false });

  // 🔹 Clear displayed table
  this.displayedData.data = [];
  this.pagedData = [];

  // 🔹 Reset paginator
  if (this.paginator) {
    this.paginator.firstPage();
  }

  this.updatePagination();
}



  updatePagination() {
  if (!this.paginator) return;

  // 🔴 THIS LINE WAS MISSING (MOST IMPORTANT)
  this.paginator.length = this.displayedData.data.length;

  const start = this.paginator.pageIndex * this.paginator.pageSize;
  const end = start + this.paginator.pageSize;

  this.pagedData = this.displayedData.data.slice(start, end);
}


  openImage(imgUrl: string) {
    window.open(imgUrl, '_blank');
  }

  exportPDF() {
  if (!this.filteredData.length) return;

  const doc = new jsPDF('l', 'mm', 'a4');
  const logo = new Image();
  logo.src = 'assets/images/logo/logo.jpeg';

  logo.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // --- Logo ---
    doc.addImage(logo, 'JPEG', 10, 10, 25, 25);

    const now = new Date();
    doc.setFontSize(9);
    doc.text(`Printed On: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, pageWidth - 10, 20, { align: 'right' });

    // --- Title ---
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.text('VEHICLE IN/OUT REPORT', pageWidth / 2, 20, { align: 'center' });
    doc.setFont(undefined, 'normal');

    // --- Compute actual date range from pagedData ---
    const dates = this.filteredData
      .map(d => new Date(d.inoutTime))
      .filter(d => !isNaN(d.getTime()));

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

    // --- Table ---
    autoTable(doc, {
      startY: 40,
      head: [['Sr No', 'Vehicle No', 'Vehicle Type', 'Name', 'Building', 'Flat', 'Location', 'IN/OUT', 'Time & Date', 'Neighbourhood']],
      body: this.filteredData.map((v, i) => [
        i + 1, v.vehicleNumber, v.vehicleCategory, v.ownerName, v.building, v.flatNumber,
        v.cameraLocation, v.inoutFlag, v.inoutTime, v.nrdName
      ]),
      headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
      theme: 'grid',
      bodyStyles: {
    fontSize: 9,                 // ⬅ increase
    textColor: [0, 0, 0],         // ⬅ force black
    fontStyle: 'normal'
  },
      didDrawPage: (data) => {
        const currentPage = data.pageNumber;
        const pageCount = (doc as any).internal.pages.length - 1;

        doc.setFontSize(9);
        doc.text(`Page ${currentPage} of ${pageCount}`, pageWidth - 10, pageHeight - 10, { align: 'right' });
        doc.setFontSize(9);
        doc.text('©IDS ID Smart Tech', 10, pageHeight - 10);
      }
    });

    doc.save('VehicleInOutReport.pdf');
  };
}




  exportExcel() {
  if (!this.filteredData.length) return;

  const f = this.reportForm.value;
  const from = f.fromDate ? new Date(f.fromDate).toLocaleDateString() : null;
  const to = f.toDate ? new Date(f.toDate).toLocaleDateString() : null;
  const generated = new Date().toLocaleString();

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('VehicleInOut');

  // --- Heading ---
  worksheet.mergeCells('A1:J1');
  const headingCell = worksheet.getCell('A1');
  headingCell.value = 'VEHICLE IN/OUT REPORT';
  headingCell.font = { bold: true, size: 18 };
  headingCell.alignment = { horizontal: 'center' };

  let currentRow = 2;

  // --- Date Range ---
  if (from && to) {
    worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
    const dateCell = worksheet.getCell(`A${currentRow}`);
    dateCell.value = `from: ${from} to ${to}`;
    dateCell.alignment = { horizontal: 'center' };
    currentRow++;
  }

  currentRow++; // empty row

  // --- Table Header ---
  worksheet.addRow(['SR NO', 'VEHICLE NUMBER', 'Vehicle Type', 'NAME', 'BUILDING', 'FLAT No',
                    'LOCATION', 'IN / OUT', 'TIME and DATE', 'NEIGHBOURHOOD']);
  
  // Style the header row (bold, background color)
  const headerRow = worksheet.getRow(currentRow);
  headerRow.font = { bold: true, size: 12 };
  headerRow.alignment = { horizontal: 'center' };
  headerRow.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DDEBF7' } };
    cell.border = {
      top: { style: 'thin', color: { argb: '000000' } },
      left: { style: 'thin', color: { argb: '000000' } },
      right: { style: 'thin', color: { argb: '000000' } },
      bottom: { style: 'thin', color: { argb: '000000' } }
    };
  });
  
  currentRow++; // Move to the next row after the header

  // --- Table Data from pagedData ---
  this.filteredData.forEach((v, i) => {
     const dbTime = DateTimeUtil.formatDateTime(v.inoutTime); // <-- use utility here
    worksheet.addRow([
      i + 1, v.vehicleNumber, v.vehicleCategory, v.ownerName, v.building, v.flatNumber,
      v.cameraLocation, v.inoutFlag, dbTime, v.nrdName
    ]);
  });

  currentRow = worksheet.lastRow!.number + 1;

  // --- Generated On ---
  worksheet.mergeCells(`A${currentRow}:J${currentRow}`);
  const genCell = worksheet.getCell(`A${currentRow}`);
  genCell.value = `printed on: ${generated}`;
  genCell.alignment = { horizontal: 'center' };

  // --- Column Width ---
  worksheet.columns.forEach(col => { col.width = 20; });

  // Save Excel
  workbook.xlsx.writeBuffer().then(buffer => {
    saveAs(new Blob([buffer]), 'VehicleInOutReport.xlsx');
  });
}
}
