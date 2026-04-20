// import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
// import { HttpClientModule, HttpClient } from '@angular/common/http';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx-js-style';
// import { saveAs } from 'file-saver';
// import { environment } from 'src/environments/environment';
// import { sortByTimeOnly } from 'src/app/_core/shared/utils/sort.util';
// import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
// import { DateTimeUtil } from 'src/app/_core/shared/utils//datetime.util';
// import { DateAdapter } from '@angular/material/core';
// import { CustomDateAdapter } from 'src/app/_core/shared/utils/custom-date-adapter';

// @Component({
//   selector: 'app-inout-report',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     MatTableModule,
//     MatPaginatorModule,
//     MatDatepickerModule,
//     MatNativeDateModule,
//     HttpClientModule
//   ],
//   providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
//   templateUrl: './in-out-log.component.html',
//   styleUrls: ['../../../../table.css']
// })
// export class InOutLogComponent implements OnInit, AfterViewInit {

//   reportForm: FormGroup;
//   inOutData: any[] = [];
//   displayedData = new MatTableDataSource<any>([]); // table datasource
  

//   @ViewChild(MatPaginator) paginator!: MatPaginator;

//   //cardTypes: any[] = [];
//   neighbourhoods: any[] = [];
//   buildings: any[] = [];
//   allBuildings: any[] = [];
//    filteredData: any[] = []; 

//   accessModes = [
//     { value: 'IN', label: 'IN' },
//     { value: 'OUT', label: 'OUT' }

//   ];

//   searchTypes = [
//     { value: 'ownerName', label: 'Owner Name' },
//     { value: 'csnNumber', label: 'CSN Number' },
//     { value: 'ownerFlatNumber', label: 'Flat Number' }
    
//   ];
// cardTypes = [
//     { value: 'Resident', label: 'Resident' },
//     { value: 'Tenant', label: 'Tenant' },
//     { value: 'Service provider', label: 'Service provider' },
//     { value: 'Contractor Employee', label: 'Employee' },
//     { value: 'Land Owner', label: 'Land Owner' },
//     { value: 'Guest', label: 'Guest' }
//   ];

//   cardTypeMap: { [key: string]: string[] } = {
//     'Resident': ['DResident', 'PResident'],
//     'Tenant': ['DTenant', 'PTenant'],
//     'Service provider': ['SProvider'],
//     'Contractor Employee': ['Employee'],
//     'Land Owner': ['DLandOwner', 'PLandOwner'],
//     'Guest': ['Guest']
//   };

//   constructor(private fb: FormBuilder, private http: HttpClient, private sortService: TableSortService) {  
//     const today = new Date(); 
//   this.reportForm = this.fb.group({
//   accessMode: [[]],   // empty array on load
//   fromDate: [today],
//   fromTime: [''],
//   toDate: [today],
//   toTime: [''],
//   cardType: [[]],     // empty array on load
//   neighbourhood: [[]],
//   buildingName: [[]],
//   searchType: [''],
//   searchValue: ['']
// });

// }



// ngOnInit() {
//   this.loadData(); // load data internally but don't assign to table yet
//   this.loadNRDList();
//   this.loadBuildingList();

//   // Listen for changes but don't filter automatically (optional)
//   this.reportForm.get('searchValue')?.valueChanges.subscribe(() => {});
//   this.reportForm.get('searchType')?.valueChanges.subscribe(() => {});

//   // Cascading Buildings based on NRD selection
//   this.reportForm.get('neighbourhood')?.valueChanges.subscribe(selectedNRDs => {
//     if (!selectedNRDs || selectedNRDs.length === 0 || selectedNRDs.includes('ALL')) {
//       this.buildings = [...this.allBuildings];
//     } else {
//       this.buildings = this.allBuildings.filter(b => selectedNRDs.includes(b.nrdName));
//     }

//     const selectedBuildings = this.reportForm.get('buildingName')?.value || [];
//     const validBuildings = this.buildings.map(b => b.value);
//     const filteredSelection = selectedBuildings.filter(b => validBuildings.includes(b));
//     this.reportForm.get('buildingName')?.setValue(filteredSelection, { emitEvent: false });
//   });

//   // Do NOT populate the table yet
//   this.displayedData.data = []; // empty table columns only
// }




// //   ngAfterViewInit() {
// //   this.displayedData.paginator = this.paginator;
// //   this.paginator.page.subscribe(() => {
// //     this.updatePagedData();
// //   });
// //   this.updatePagedData();
// // }


// ngAfterViewInit() {
//   this.paginator.page.subscribe(() => {
//     this.updatePagedData();
//   });
//   this.updatePagedData();
// }


// updatePagedData() {
//   if (!this.filteredData || !this.paginator) return;

//   // Set total length for paginator
//   this.paginator.length = this.filteredData.length;

//   // Calculate start/end indexes based on current page
//   const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
//   const endIndex = startIndex + this.paginator.pageSize;

//   // Slice filtered data for current page
//   this.displayedData.data = this.filteredData.slice(startIndex, endIndex);
// }


// public sortColumn(column: string) {
//   // Check if the clicked column is the same as the last sorted column
//   if (this.sortService.getSortColumn() === column) {
//     // Same column clicked: toggle the sorting direction
//     this.sortService.toggleDirection();
//   } else {
//     // New column clicked: default to ascending sort
//     this.sortService.setSortColumn(column, 'asc');
//   }

//   // Apply sorting to the data (with a clone to prevent mutating the original data)
//   this.displayedData.data = this.sortService.sortData([...this.displayedData.data], column);

//   // Reset pagination to the first page after sorting
//   if (this.paginator) {
//     this.paginator.firstPage();
//   }
// }


// // Methods for template
// getSortColumn(): string {
//   return this.sortService.getSortColumn();
// }

// getSortDirection(): 'asc' | 'desc' {
//   return this.sortService.getSortDirection();
// }



// //Api call to get all data - but do NOT assign to table until user clicks Search
// loadData() {
//   this.http.get<any[]>(`${environment.apiurl}Report/InoutRegister`).subscribe(res => {
//     this.inOutData = res || [];
//     this.filteredData = [...this.inOutData]; 

   
//   });
// }


// //hard coded data until API is ready

// // loadData() {
// //   this.inOutData = Array.from({ length: 20 }, (_, i) => ({
// //     ownerName: `Owner ${i + 1}`,
// //     nrdName: `NRD ${(i % 3) + 1}`,
// //     buildingName: `Building-${String.fromCharCode(65 + (i % 4))}`,
// //     csnNumber: `CSN100${i + 1}`,
// //     accessmode: i % 2 === 0 ? 'IN' : 'OUT',
// //     inoutTime: new Date(2026, 2, 11, 10 + (i % 8), i * 3 % 60).toISOString(),
// //     cardType: ['DResident', 'DTenant', 'SProvider', 'Employee', 'Guest'][i % 5]
// //   }));
// //   this.filteredData = [...this.inOutData];
// // }

// // onCardTypeChange(event: any) {
// //   const selected = event.value;

// //   if (selected.includes('ALL')) {
// //     // User clicked All → show only ALL in UI
// //     this.reportForm.get('cardType')?.setValue(['ALL'], { emitEvent: false });
// //   } else {
// //     // Remove ALL if any other selected
// //     this.reportForm.get('cardType')?.setValue(selected.filter(v => v !== 'ALL'), { emitEvent: false });
// //   }
// // }

// // // Neighbourhood: Select All logic
// // onNeighbourhoodChange(event: any) {
// //   const selected = event.value;
// //   if (selected.includes('ALL')) {
// //     // Only show ALL in the UI
// //     this.reportForm.get('neighbourhood')?.setValue(['ALL'], { emitEvent: false });
// //   } 
// //   // Optional: remove ALL if user selects something else
// //   else if (selected.length && selected.includes('ALL') === false) {
// //     this.reportForm.get('neighbourhood')?.setValue(selected.filter(v => v !== 'ALL'), { emitEvent: false });
// //   }
// // }


// // // Building: Select All logic
// // onBuildingChange(event: any) {
// //   const selected = event.value;
// //   if (selected.includes('ALL')) {
// //     // Only show ALL in the UI
// //     this.reportForm.get('buildingName')?.setValue(['ALL'], { emitEvent: false });
// //   } 
// //   // Optional: remove ALL if user selects something else
// //   else if (selected.length && !selected.includes('ALL')) {
// //     this.reportForm.get('buildingName')?.setValue(selected.filter(v => v !== 'ALL'), { emitEvent: false });
// //   }
// // }


// // onAccessModeChange(event: any) {
// //   const selected = event.value;

// //   if (selected.includes('ALL')) {
// //     this.reportForm.get('accessMode')?.setValue(['ALL'], { emitEvent: false });
// //   } else {
// //     this.reportForm.get('accessMode')?.setValue(selected.filter(v => v !== 'ALL'), { emitEvent: false });
// //   }
// // }

// onCardTypeChange(event: any) {
//   const selected = event.value;
//   if (selected.includes('ALL')) {
//     this.reportForm.get('cardType')?.setValue(
//       ['ALL', ...this.cardTypes.map(c => c.value)], { emitEvent: false }
//     );
//   } else {
//     this.reportForm.get('cardType')?.setValue(
//       selected.filter(v => v !== 'ALL'), { emitEvent: false }
//     );
//   }
// }

// onAccessModeChange(event: any) {
//   const selected = event.value;
//   if (selected.includes('ALL')) {
//     this.reportForm.get('accessMode')?.setValue(
//       ['ALL', ...this.accessModes.map(a => a.value)], { emitEvent: false }
//     );
//   } else {
//     this.reportForm.get('accessMode')?.setValue(
//       selected.filter(v => v !== 'ALL'), { emitEvent: false }
//     );
//   }
// }

// onNeighbourhoodChange(event: any) {
//   const selected = event.value;
//   if (selected.includes('ALL')) {
//     this.reportForm.get('neighbourhood')?.setValue(
//       ['ALL', ...this.neighbourhoods.map(n => n.value)], { emitEvent: false }
//     );
//     this.buildings = [...this.allBuildings];
//   } else if (selected.length && !selected.includes('ALL')) {
//     this.reportForm.get('neighbourhood')?.setValue(
//       selected.filter(v => v !== 'ALL'), { emitEvent: false }
//     );
//   }
// }

// onBuildingChange(event: any) {
//   const selected = event.value;
//   if (selected.includes('ALL')) {
//     this.reportForm.get('buildingName')?.setValue(
//       ['ALL', ...this.buildings.map(b => b.value)], { emitEvent: false }
//     );
//   } else if (selected.length && !selected.includes('ALL')) {
//     this.reportForm.get('buildingName')?.setValue(
//       selected.filter(v => v !== 'ALL'), { emitEvent: false }
//     );
//   }
// }

//   loadNRDList() {
//     this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe(res => {
//       this.neighbourhoods = res.map(n => ({ value: n.name, label: n.name }));
//     });
//   }

//   loadBuildingList() {
//     this.http.get<any[]>(`${environment.apiurl}Building`).subscribe(res => {
//       this.allBuildings = res.map(b => ({
//         value: b.name,
//         label: b.name,
//         nrdName: b.nrdName,
//         buildingName: b.name
//       }));
//       this.buildings = [...this.allBuildings];
//     });
//   }

//   // ------------------- Helper -------------------
//   stripTime(d: Date): Date {
//     return new Date(d.getFullYear(), d.getMonth(), d.getDate());
//   }


// applyFilters() {
//   const f = this.reportForm.value;
//   if (f.searchValue?.trim() && !f.searchType) {
//     alert('Please select a search type');
//     return;
//   }

//   let data = [...this.inOutData]; // main API

//   // --------------------------
//   // Access Mode Filter
//   // Access Mode Filter (case-insensitive)
// if (f.accessMode && f.accessMode.length) {
//   let allowedAccessModes = f.accessMode.includes('ALL') 
//     ? this.accessModes.map(a => a.value.toLowerCase())  // lowercase
//     : f.accessMode.map((m: string) => m.toLowerCase()); // lowercase

//   data = data.filter(x => allowedAccessModes.includes(x.accessmode?.toLowerCase()));
// }


// // Card Type Filter
// if (f.cardType && f.cardType.length) {
//   let allowedApiCardTypes = f.cardType.includes('ALL')
//     ? Object.values(this.cardTypeMap).flat()  // expand All internally
//     : f.cardType.flatMap((uiType: string) => this.cardTypeMap[uiType] || []);

//   data = data.filter(x => allowedApiCardTypes.includes(x.cardType));
// }




//   // --------------------------
//   // Neighbourhood Filter
//   // --------------------------
//   if (f.neighbourhood && f.neighbourhood.length) {
//     const nrdFilter = f.neighbourhood.includes('ALL')
//       ? Array.from(new Set(data.map(d => d.nrdName).filter(Boolean)))
//       : f.neighbourhood;
//     data = data.filter(x => nrdFilter.includes(x.nrdName));
//   }

//   // --------------------------
//   // Building Filter
//   // --------------------------
//   if (f.buildingName && f.buildingName.length) {
//     const buildingFilter = f.buildingName.includes('ALL')
//       ? Array.from(new Set(data.map(d => d.buildingName).filter(Boolean)))
//       : f.buildingName;
//     data = data.filter(x => buildingFilter.includes(x.buildingName));
//   }

//   // --------------------------
//   // DATE & TIME FILTER
//   // --------------------------
//   if (f.fromDate) {
//     const from = new Date(f.fromDate);
//     if (f.fromTime) {
//       const [h, m] = f.fromTime.split(':').map(Number);
//       from.setHours(h, m, 0, 0);
//     } else {
//       from.setHours(0, 0, 0, 0);
//     }
//     data = data.filter(x => x.inoutTime && new Date(x.inoutTime) >= from);
//   }

//   if (f.toDate) {
//     const to = new Date(f.toDate);
//     if (f.toTime) {
//       const [h, m] = f.toTime.split(':').map(Number);
//       to.setHours(h, m, 59, 999);
//     } else {
//       to.setHours(23, 59, 59, 999);
//     }
//     data = data.filter(x => x.inoutTime && new Date(x.inoutTime) <= to);
//   }

//   // --------------------------
//   // Search Filter
//   // --------------------------
//   if (f.searchType && f.searchValue?.trim() !== '') {
//     const txt = f.searchValue.toLowerCase();
//     data = data.filter(item => item[f.searchType]?.toString().toLowerCase().startsWith(txt));
//   }

//   // --------------------------
//   // Sort by time
//   // --------------------------
//   data = sortByTimeOnly(data, 'inoutTime', 'asc');
//   this.filteredData = data; // filtered and sorted data

// if (this.paginator) {
//   this.paginator.length = this.filteredData.length;
//   this.paginator.pageIndex = 0; // reset to first page
// }
// this.updatePagedData();




// }



//   // applyAutoFilter() {
//   //   const f = this.reportForm.value;
//   //   if (!f.searchValue?.trim()) {
//   //     this.displayedData.data = [...this.inOutData];
//   //     if (this.paginator) this.paginator.firstPage();
//   //     return;
//   //   }

//   //   const txt = f.searchValue.toLowerCase();
//   //   this.displayedData.data = this.inOutData.filter(item =>
//   //     item[f.searchType]?.toString().toLowerCase().startsWith(txt)
//   //   );
//   //   if (this.paginator) this.paginator.firstPage();
//   // }

//   showReports() {
//   // Populate table only when user clicks Search
//   this.applyFilters();
// }


//   Clear() {
//     this.reportForm.reset({
//       accessMode: '',
//       fromDate: '',
//       toDate: '',
//       cardType: [],
//       neighbourhood: [],
//       buildingName: [],
//       searchType: '',
//       searchValue: ''
//     }, { emitEvent: false });
   
//     if (this.paginator) this.paginator.firstPage();
//   }

  




//   // ------------------- PDF Export -------------------
//   exportPDF() {
//     if (!this.filteredData.length) return;

//     const generated = new Date().toLocaleString();
//     const doc = new jsPDF('l', 'mm', 'a4');
//     const logo = new Image();
//     logo.src = 'assets/images/logo/logo.jpeg';

//     logo.onload = () => {
//       const pageWidth = doc.internal.pageSize.getWidth();
//       const pageHeight = doc.internal.pageSize.getHeight();

//       doc.addImage(logo, 'JPEG', 10, 10, 15, 15);
//       doc.setFontSize(18);
//       doc.setFont(undefined, 'bold');
//       doc.text('IN-OUT REPORT', pageWidth / 2, 20, { align: 'center' });

//       const dates = this.filteredData.map(r => r.inoutTime ? new Date(r.inoutTime) : null).filter(d => d);
//       if (dates.length) {
//         const min = new Date(Math.min(...dates.map(d => d!.getTime())));
//         const max = new Date(Math.max(...dates.map(d => d!.getTime())));
//         doc.setFontSize(11);
//         doc.setFont(undefined, 'normal');
//         doc.text(`From: ${min.toLocaleDateString()} to ${max.toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
//       }

//       doc.setFontSize(10);
//       doc.text(`Printed On: ${generated}`, pageWidth - 10, 20, { align: 'right' });

//       const body = this.filteredData.map((r, i) => [
//         i + 1,
//         r.ownerName || 'N/A',
//         r.nrdName || 'N/A',
//         r.buildingName || 'N/A',
//         r.csnNumber || 'N/A',
//         r.accessmode || 'N/A',
//         r.inoutTime ? new Date(r.inoutTime).toLocaleString() : 'N/A',
//         r.cardType || 'N/A'
//       ]);

//       autoTable(doc, {
//         startY: 35,
//         head: [['Sr No', 'Name', 'Neighbourhood', 'Building', 'CSN', 'Access Mode', 'AccessTime', 'Card Type']],
//         body,
//         theme: 'grid',
//         headStyles: { fillColor: [220, 220, 220], textColor: 20, fontStyle: 'bold' },
//          bodyStyles: {
//     fontSize: 9,                 // ⬅ increase
//     textColor: [0, 0, 0],         // ⬅ force black
//     fontStyle: 'normal'
//   },

//         didDrawPage: (data) => {
//           doc.setFontSize(10);
//           doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
//           doc.text('©IDS ID SMART TECH', 10, pageHeight - 10);
//         }
//       });

//       doc.save('InOutReport.pdf');
//     };
//   }

//   // ------------------- Excel Export -------------------
//   exportExcel() {
//     if (!this.filteredData.length) return;

//     const printedDate = new Date().toLocaleString();

//     const excelData = this.filteredData.map((r, i) => ({
//       'Sr No': i + 1,
//       'Name': r.ownerName || '',
//       'Neighbourhood': r.nrdName || '',
//       'Building': r.buildingName || '',
//       'CSN': r.csnNumber || '',
//       'Access Mode': r.accessmode || '',
//        'AccessTime': r.inoutTime ? DateTimeUtil.formatDateTime(r.inoutTime) : '',
//       'Card Type': r.cardType || ''
//     }));

//     const wb = XLSX.utils.book_new();
//     const wsData: any[][] = [
//       ["IN-OUT REPORT", "", "", "", "", "", "", "", `Printed: ${printedDate}`],
//       [],
//       Object.keys(excelData[0])
//     ];

//     excelData.forEach(row => wsData.push(Object.values(row)));

//     const ws = XLSX.utils.aoa_to_sheet(wsData);
//     ws["A1"].s = { font: { bold: true, sz: 20 }, alignment: { horizontal: "center" } };
//     const totalColumns = Object.keys(excelData[0]).length;
//     ws["!merges"] = ws["!merges"] || [];
//     ws["!merges"].push({ s: { r: 0, c: 0 }, e: { r: 0, c: totalColumns - 2 } });

//     const printedCell = XLSX.utils.encode_cell({ r: 0, c: totalColumns - 1 });
//     ws[printedCell].s = { font: { bold: true, sz: 12 }, alignment: { horizontal: "right" } };

//     const headers = Object.keys(excelData[0]);
//     headers.forEach((h, idx) => {
//       const cell = XLSX.utils.encode_cell({ r: 2, c: idx });
//       ws[cell].s = {
//         font: { bold: true, sz: 12 },
//         alignment: { horizontal: "center" },
//         fill: { fgColor: { rgb: "DDEBF7" } },
//         border: {
//           top: { style: "thin", color: { rgb: "000000" } },
//           bottom: { style: "thin", color: { rgb: "000000" } },
//           left: { style: "thin", color: { rgb: "000000" } },
//           right: { style: "thin", color: { rgb: "000000" } }
//         }
//       };
//     });

//     ws["!cols"] = headers.map(h => ({ wch: h.length + 15 }));

//     XLSX.utils.book_append_sheet(wb, ws, "InOutReport");

//     const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
//     saveAs(new Blob([buffer]), "InOutReport.xlsx");
//   }
// }


//new code

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
import { DateTimeUtil } from 'src/app/_core/shared/utils//datetime.util';
import { DateAdapter } from '@angular/material/core';
import { CustomDateAdapter } from 'src/app/_core/shared/utils/custom-date-adapter';

@Component({
  selector: 'app-inout-report',
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
    MatDatepickerModule,
    MatNativeDateModule,
    HttpClientModule
  ],
  providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
  templateUrl: './in-out-log.component.html',
  styleUrls: ['../../../../table.css']
})
export class InOutLogComponent implements OnInit, AfterViewInit {

  reportForm: FormGroup;
  inOutData: any[] = [];
  displayedData = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  neighbourhoods: any[] = [];
  buildings: any[] = [];
  allBuildings: any[] = [];
  filteredData: any[] = [];

  // Track previous selections to correctly handle ALL toggle vs individual item deselect
  private prevCardType: string[] = [];
  private prevAccessMode: string[] = [];
  private prevNeighbourhood: string[] = [];
  private prevBuildingName: string[] = [];

  accessModes = [
    { value: 'IN', label: 'IN' },
    { value: 'OUT', label: 'OUT' }
  ];

  searchTypes = [
    { value: 'ownerName', label: 'Owner Name' },
    { value: 'csnNumber', label: 'CSN Number' },
    { value: 'ownerFlatNumber', label: 'Flat Number' }
  ];

  cardTypes = [
    { value: 'Resident', label: 'Resident' },
    { value: 'Tenant', label: 'Tenant' },
    { value: 'Service provider', label: 'Service provider' },
    { value: 'Contractor Employee', label: 'Employee' },
    { value: 'Land Owner', label: 'Land Owner' },
    { value: 'Guest', label: 'Guest' }
  ];

  cardTypeMap: { [key: string]: string[] } = {
    'Resident': ['DResident', 'PResident'],
    'Tenant': ['DTenant', 'PTenant'],
    'Service provider': ['SProvider'],
    'Contractor Employee': ['Employee'],
    'Land Owner': ['DLandOwner', 'PLandOwner'],
    'Guest': ['Guest']
  };

  constructor(private fb: FormBuilder, private http: HttpClient, private sortService: TableSortService) {
    const today = new Date();
    this.reportForm = this.fb.group({
      accessMode: [[]],
      fromDate: [today],
      fromTime: [''],
      toDate: [today],
      toTime: [''],
      cardType: [[]],
      neighbourhood: [[]],
      buildingName: [[]],
      searchType: [''],
      searchValue: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    this.loadNRDList();
    this.loadBuildingList();

    this.reportForm.get('searchValue')?.valueChanges.subscribe(() => {});
    this.reportForm.get('searchType')?.valueChanges.subscribe(() => {});

    this.reportForm.get('neighbourhood')?.valueChanges.subscribe(selectedNRDs => {
      if (!selectedNRDs || selectedNRDs.length === 0 || selectedNRDs.includes('ALL')) {
        this.buildings = [...this.allBuildings];
      } else {
        this.buildings = this.allBuildings.filter(b => selectedNRDs.includes(b.nrdName));
      }

      const selectedBuildings = this.reportForm.get('buildingName')?.value || [];
      const validBuildings = this.buildings.map(b => b.value);
      const filteredSelection = selectedBuildings.filter(b => validBuildings.includes(b));
      this.reportForm.get('buildingName')?.setValue(filteredSelection, { emitEvent: false });
    });

    this.displayedData.data = [];
  }

  ngAfterViewInit() {
    this.paginator.page.subscribe(() => {
      this.updatePagedData();
    });
    this.updatePagedData();
  }

  updatePagedData() {
    if (!this.filteredData || !this.paginator) return;
    this.paginator.length = this.filteredData.length;
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    const endIndex = startIndex + this.paginator.pageSize;
    this.displayedData.data = this.filteredData.slice(startIndex, endIndex);
  }

  public sortColumn(column: string) {
    if (this.sortService.getSortColumn() === column) {
      this.sortService.toggleDirection();
    } else {
      this.sortService.setSortColumn(column, 'asc');
    }
    this.displayedData.data = this.sortService.sortData([...this.displayedData.data], column);
    if (this.paginator) {
      this.paginator.firstPage();
    }
  }

  getSortColumn(): string {
    return this.sortService.getSortColumn();
  }

  getSortDirection(): 'asc' | 'desc' {
    return this.sortService.getSortDirection();
  }

  loadData() {
    this.http.get<any[]>(`${environment.apiurl}Report/InoutRegister`).subscribe(res => {
      this.inOutData = Array.isArray(res) ? res : [];
      this.filteredData = [...this.inOutData];
    });
  }

  // Returns label string for mat-select-trigger — never includes "All" word
  getDisplayValue(controlName: string, options: { value: string; label: string }[]): string {
    const values: string[] = this.reportForm.get(controlName)?.value || [];
    const individual = values.filter(v => v !== 'ALL');
    if (individual.length === 0) return '';
    return options
      .filter(o => individual.includes(o.value))
      .map(o => o.label)
      .join(', ');
  }

  onCardTypeChange(event: any) {
    const selected: string[] = event.value;
    const allValues = this.cardTypes.map(c => c.value);
    const allWasPrev = this.prevCardType.includes('ALL');
    const allIsNow = selected.includes('ALL');

    let newValue: string[];

    if (!allWasPrev && allIsNow) {
      newValue = ['ALL', ...allValues];
    } else if (allWasPrev && !allIsNow) {
      newValue = [];
    } else if (allWasPrev && allIsNow) {
      newValue = selected.filter(v => v !== 'ALL');
    } else {
      newValue = selected.filter(v => v !== 'ALL');
      if (allValues.every(v => newValue.includes(v))) {
        newValue = ['ALL', ...allValues];
      }
    }

    this.prevCardType = newValue;
    this.reportForm.get('cardType')?.setValue(newValue, { emitEvent: false });
  }

  onAccessModeChange(event: any) {
    const selected: string[] = event.value;
    const allValues = this.accessModes.map(a => a.value);
    const allWasPrev = this.prevAccessMode.includes('ALL');
    const allIsNow = selected.includes('ALL');

    let newValue: string[];

    if (!allWasPrev && allIsNow) {
      newValue = ['ALL', ...allValues];
    } else if (allWasPrev && !allIsNow) {
      newValue = [];
    } else if (allWasPrev && allIsNow) {
      newValue = selected.filter(v => v !== 'ALL');
    } else {
      newValue = selected.filter(v => v !== 'ALL');
      if (allValues.every(v => newValue.includes(v))) {
        newValue = ['ALL', ...allValues];
      }
    }

    this.prevAccessMode = newValue;
    this.reportForm.get('accessMode')?.setValue(newValue, { emitEvent: false });
  }

  onNeighbourhoodChange(event: any) {
    const selected: string[] = event.value;
    const allValues = this.neighbourhoods.map(n => n.value);
    const allWasPrev = this.prevNeighbourhood.includes('ALL');
    const allIsNow = selected.includes('ALL');

    let newValue: string[];

    if (!allWasPrev && allIsNow) {
      newValue = ['ALL', ...allValues];
      this.buildings = [...this.allBuildings];
    } else if (allWasPrev && !allIsNow) {
      newValue = [];
    } else if (allWasPrev && allIsNow) {
      newValue = selected.filter(v => v !== 'ALL');
    } else {
      newValue = selected.filter(v => v !== 'ALL');
      if (allValues.every(v => newValue.includes(v))) {
        newValue = ['ALL', ...allValues];
      }
    }

    this.prevNeighbourhood = newValue;
    this.reportForm.get('neighbourhood')?.setValue(newValue, { emitEvent: false });
  }

  onBuildingChange(event: any) {
    const selected: string[] = event.value;
    const allValues = this.buildings.map(b => b.value);
    const allWasPrev = this.prevBuildingName.includes('ALL');
    const allIsNow = selected.includes('ALL');

    let newValue: string[];

    if (!allWasPrev && allIsNow) {
      newValue = ['ALL', ...allValues];
    } else if (allWasPrev && !allIsNow) {
      newValue = [];
    } else if (allWasPrev && allIsNow) {
      newValue = selected.filter(v => v !== 'ALL');
    } else {
      newValue = selected.filter(v => v !== 'ALL');
      if (allValues.every(v => newValue.includes(v))) {
        newValue = ['ALL', ...allValues];
      }
    }

    this.prevBuildingName = newValue;
    this.reportForm.get('buildingName')?.setValue(newValue, { emitEvent: false });
  }

  loadNRDList() {
    this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe(res => {
      this.neighbourhoods = res.map(n => ({ value: n.name, label: n.name }));
    });
  }

  loadBuildingList() {
    this.http.get<any[]>(`${environment.apiurl}Building`).subscribe(res => {
      this.allBuildings = res.map(b => ({
        value: b.name,
        label: b.name,
        nrdName: b.nrdName,
        buildingName: b.name
      }));
      this.buildings = [...this.allBuildings];
    });
  }

  stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }

  applyFilters() {
    const f = this.reportForm.value;
    if (f.searchValue?.trim() && !f.searchType) {
      alert('Please select a search type');
      return;
    }

    let data = Array.isArray(this.inOutData) ? [...this.inOutData] : [];

    // Access Mode Filter (case-insensitive)
    if (f.accessMode && f.accessMode.length) {
      const allowedAccessModes = f.accessMode.includes('ALL')
        ? this.accessModes.map(a => a.value.toLowerCase())
        : f.accessMode.map((m: string) => m.toLowerCase());
      data = data.filter(x => allowedAccessModes.includes(x.accessmode?.toLowerCase()));
    }

    // Card Type Filter
    if (f.cardType && f.cardType.length) {
      const allowedApiCardTypes = f.cardType.includes('ALL')
        ? Object.values(this.cardTypeMap).flat()
        : f.cardType.flatMap((uiType: string) => this.cardTypeMap[uiType] || []);
      data = data.filter(x => allowedApiCardTypes.includes(x.cardType));
    }

    // Neighbourhood Filter
    if (f.neighbourhood && f.neighbourhood.length) {
      const nrdFilter = f.neighbourhood.includes('ALL')
        ? Array.from(new Set(data.map(d => d.nrdName).filter(Boolean)))
        : f.neighbourhood;
      data = data.filter(x => nrdFilter.includes(x.nrdName));
    }

    // Building Filter
    if (f.buildingName && f.buildingName.length) {
      const buildingFilter = f.buildingName.includes('ALL')
        ? Array.from(new Set(data.map(d => d.buildingName).filter(Boolean)))
        : f.buildingName;
      data = data.filter(x => buildingFilter.includes(x.buildingName));
    }

    // Date & Time Filter
    if (f.fromDate) {
      const from = new Date(f.fromDate);
      if (f.fromTime) {
        const [h, m] = f.fromTime.split(':').map(Number);
        from.setHours(h, m, 0, 0);
      } else {
        from.setHours(0, 0, 0, 0);
      }
      data = data.filter(x => x.inoutTime && new Date(x.inoutTime) >= from);
    }

    if (f.toDate) {
      const to = new Date(f.toDate);
      if (f.toTime) {
        const [h, m] = f.toTime.split(':').map(Number);
        to.setHours(h, m, 59, 999);
      } else {
        to.setHours(23, 59, 59, 999);
      }
      data = data.filter(x => x.inoutTime && new Date(x.inoutTime) <= to);
    }

    // Search Filter
    // if (f.searchType && f.searchValue?.trim() !== '') {
    //   const txt = f.searchValue.toLowerCase();
    //   data = data.filter(item => item[f.searchType]?.toString().toLowerCase().startsWith(txt));
    // }

    if (f.searchType && f.searchValue?.trim()) {
  const txt = f.searchValue.toString().trim().toLowerCase();

  data = data.filter(item => {
    const value = item[f.searchType]?.toString().toLowerCase() || '';

    // Create safe regex (escape special chars)
    const escapedTxt = txt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Regex: match word boundary OR non-alphanumeric boundary
    const regex = new RegExp(`(^|[^a-z0-9])${escapedTxt}($|[^a-z0-9])`);

    return regex.test(value);
  });
}

    // Sort by time
    data = sortByTimeOnly(data, 'inoutTime', 'asc');
    this.filteredData = data;

    if (this.paginator) {
      this.paginator.length = this.filteredData.length;
      this.paginator.pageIndex = 0;
    }
    this.updatePagedData();
  }

  showReports() {
    this.applyFilters();
  }

  Clear() {
    this.reportForm.reset({
      accessMode: '',
      fromDate: '',
      toDate: '',
      cardType: [],
      neighbourhood: [],
      buildingName: [],
      searchType: '',
      searchValue: ''
    }, { emitEvent: false });

    this.prevCardType = [];
    this.prevAccessMode = [];
    this.prevNeighbourhood = [];
    this.prevBuildingName = [];

    if (this.paginator) this.paginator.firstPage();
  }

  // ------------------- PDF Export -------------------
  exportPDF() {
    if (!this.filteredData.length) return;

    const generated = new Date().toLocaleString();
    const doc = new jsPDF('l', 'mm', 'a4');
    const logo = new Image();
    logo.src = 'assets/images/logo/logo.jpeg';

    logo.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.addImage(logo, 'JPEG', 10, 10, 15, 15);
      doc.setFontSize(18);
      doc.setFont(undefined, 'bold');
      doc.text('IN-OUT REPORT', pageWidth / 2, 20, { align: 'center' });

      const dates = this.filteredData.map(r => r.inoutTime ? new Date(r.inoutTime) : null).filter(d => d);
      if (dates.length) {
        const min = new Date(Math.min(...dates.map(d => d!.getTime())));
        const max = new Date(Math.max(...dates.map(d => d!.getTime())));
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');
        doc.text(`From: ${min.toLocaleDateString()} to ${max.toLocaleDateString()}`, pageWidth / 2, 28, { align: 'center' });
      }

      doc.setFontSize(10);
      doc.text(`Printed On: ${generated}`, pageWidth - 10, 20, { align: 'right' });

      const body = this.filteredData.map((r, i) => [
        i + 1,
        r.ownerName || 'N/A',
        r.nrdName || 'N/A',
        r.buildingName || 'N/A',
        r.csnNumber || 'N/A',
        r.accessmode || 'N/A',
        r.inoutTime ? new Date(r.inoutTime).toLocaleString() : 'N/A',
        r.cardType || 'N/A'
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Sr No', 'Name', 'Neighbourhood', 'Building', 'CSN', 'Access Mode', 'AccessTime', 'Card Type']],
        body,
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: 20, fontStyle: 'bold' },
        bodyStyles: {
          fontSize: 9,
          textColor: [0, 0, 0],
          fontStyle: 'normal'
        },
        didDrawPage: (data) => {
          doc.setFontSize(10);
          doc.text(`Page ${data.pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
          doc.text('©IDS ID SMART TECH', 10, pageHeight - 10);
        }
      });

      doc.save('InOutReport.pdf');
    };
  }

  // ------------------- Excel Export -------------------
  exportExcel() {
    if (!this.filteredData.length) return;

    const printedDate = new Date().toLocaleString();

    const excelData = this.filteredData.map((r, i) => ({
      'Sr No': i + 1,
      'Name': r.ownerName || '',
      'Neighbourhood': r.nrdName || '',
      'Building': r.buildingName || '',
      'CSN': r.csnNumber || '',
      'Access Mode': r.accessmode || '',
      'AccessTime': r.inoutTime ? DateTimeUtil.formatDateTime(r.inoutTime) : '',
      'Card Type': r.cardType || ''
    }));

    const wb = XLSX.utils.book_new();
    const wsData: any[][] = [
      ["IN-OUT REPORT", "", "", "", "", "", "", "", `Printed: ${printedDate}`],
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

    XLSX.utils.book_append_sheet(wb, ws, "InOutReport");

    const buffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([buffer]), "InOutReport.xlsx");
  }
}





// hard coded data for testing
// import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { MatButtonModule } from '@angular/material/button';
// import { MatTableDataSource, MatTableModule } from '@angular/material/table';
// import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatNativeDateModule } from '@angular/material/core';
// import { HttpClientModule, HttpClient } from '@angular/common/http';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
// import * as XLSX from 'xlsx-js-style';
// import { saveAs } from 'file-saver';
// import { environment } from 'src/environments/environment';
// import { sortByTimeOnly } from 'src/app/_core/shared/utils/sort.util';
// import { TableSortService } from 'src/app/_core/shared/services/table-sort.services';
// import { DateTimeUtil } from 'src/app/_core/shared/utils//datetime.util';
// import { DateAdapter } from '@angular/material/core';
// import { CustomDateAdapter } from 'src/app/_core/shared/utils/custom-date-adapter';

// @Component({
//   selector: 'app-inout-report',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MatFormFieldModule,
//     MatInputModule,
//     MatSelectModule,
//     MatButtonModule,
//     MatTableModule,
//     MatPaginatorModule,
//     MatDatepickerModule,
//     MatNativeDateModule,
//     HttpClientModule
//   ],
//   providers: [{ provide: DateAdapter, useClass: CustomDateAdapter }],
//   templateUrl: './in-out-log.component.html',
//   styleUrls: ['../../../../table.css']
// })
// export class InOutLogComponent implements OnInit, AfterViewInit {

//   reportForm: FormGroup;
//   inOutData: any[] = [];
//   displayedData = new MatTableDataSource<any>([]);

//   @ViewChild(MatPaginator) paginator!: MatPaginator;

//   neighbourhoods: any[] = [];
//   buildings: any[] = [];
//   allBuildings: any[] = [];
//   filteredData: any[] = [];

//   private prevCardType: string[] = [];
//   private prevAccessMode: string[] = [];
//   private prevNeighbourhood: string[] = [];
//   private prevBuildingName: string[] = [];

//   accessModes = [
//     { value: 'IN', label: 'IN' },
//     { value: 'OUT', label: 'OUT' }
//   ];

//   searchTypes = [
//     { value: 'ownerName', label: 'Owner Name' },
//     { value: 'csnNumber', label: 'CSN Number' },
//     { value: 'ownerFlatNumber', label: 'Flat Number' }
//   ];

//   cardTypes = [
//     { value: 'Resident', label: 'Resident' },
//     { value: 'Tenant', label: 'Tenant' },
//     { value: 'Service provider', label: 'Service provider' },
//     { value: 'Contractor Employee', label: 'Employee' },
//     { value: 'Land Owner', label: 'Land Owner' },
//     { value: 'Guest', label: 'Guest' }
//   ];

//   cardTypeMap: { [key: string]: string[] } = {
//     'Resident': ['DResident', 'PResident'],
//     'Tenant': ['DTenant', 'PTenant'],
//     'Service provider': ['SProvider'],
//     'Contractor Employee': ['Employee'],
//     'Land Owner': ['DLandOwner', 'PLandOwner'],
//     'Guest': ['Guest']
//   };

//   constructor(private fb: FormBuilder, private http: HttpClient, private sortService: TableSortService) {
//     const today = new Date();
//     this.reportForm = this.fb.group({
//       accessMode: [[]],
//       fromDate: [today],
//       fromTime: [''],
//       toDate: [today],
//       toTime: [''],
//       cardType: [[]],
//       neighbourhood: [[]],
//       buildingName: [[]],
//       searchType: [''],
//       searchValue: ['']
//     });
//   }

//   ngOnInit() {
//     this.loadData();
//     this.loadNRDList();
//     this.loadBuildingList();

//     this.reportForm.get('searchValue')?.valueChanges.subscribe(() => {});
//     this.reportForm.get('searchType')?.valueChanges.subscribe(() => {});

//     this.reportForm.get('neighbourhood')?.valueChanges.subscribe(selectedNRDs => {
//       if (!selectedNRDs || selectedNRDs.length === 0 || selectedNRDs.includes('ALL')) {
//         this.buildings = [...this.allBuildings];
//       } else {
//         this.buildings = this.allBuildings.filter(b => selectedNRDs.includes(b.nrdName));
//       }
//       const selectedBuildings = this.reportForm.get('buildingName')?.value || [];
//       const validBuildings = this.buildings.map(b => b.value);
//       const filteredSelection = selectedBuildings.filter(b => validBuildings.includes(b));
//       this.reportForm.get('buildingName')?.setValue(filteredSelection, { emitEvent: false });
//     });

//     this.displayedData.data = [];
//   }

//   ngAfterViewInit() {
//     this.paginator.page.subscribe(() => {
//       this.updatePagedData();
//     });
//     this.updatePagedData();
//   }

//   updatePagedData() {
//     if (!this.filteredData || !this.paginator) return;
//     this.paginator.length = this.filteredData.length;
//     const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
//     const endIndex = startIndex + this.paginator.pageSize;
//     this.displayedData.data = this.filteredData.slice(startIndex, endIndex);
//   }

//   public sortColumn(column: string) {
//     if (this.sortService.getSortColumn() === column) {
//       this.sortService.toggleDirection();
//     } else {
//       this.sortService.setSortColumn(column, 'asc');
//     }
//     this.displayedData.data = this.sortService.sortData([...this.displayedData.data], column);
//     if (this.paginator) this.paginator.firstPage();
//   }

//   getSortColumn(): string { return this.sortService.getSortColumn(); }
//   getSortDirection(): 'asc' | 'desc' { return this.sortService.getSortDirection(); }

//   // ─────────────────────────────────────────────────────────────
//   // 15 HARDCODED DUMMY RECORDS  ← swap this with real API call
//   //
//   // Data is spread across:
//   //   NRD: NRD-Alpha, NRD-Beta, NRD-Gamma
//   //   Buildings: Tower-A, Tower-B (Alpha) | Tower-C, Tower-D (Beta) | Tower-E (Gamma)
//   //   Card types: DResident, PResident, DTenant, PTenant, SProvider, Employee, DLandOwner, Guest
//   //   Access mode: IN / OUT
//   //   Dates: today, yesterday, day-before-yesterday
//   //   Time: spread from 08:00 to 20:00
//   // ─────────────────────────────────────────────────────────────
//   loadData() {
//     const today     = new Date();
//     const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
//     const dayBefore = new Date(today); dayBefore.setDate(today.getDate() - 2);

//     const dt = (base: Date, h: number, m: number) => {
//       const d = new Date(base);
//       d.setHours(h, m, 0, 0);
//       return d.toISOString();
//     };

//     this.inOutData = [
//       // ── TODAY ──────────────────────────────────────────────────
//       { ownerName: 'Amit Sharma',    nrdName: 'NRD-Alpha', buildingName: 'Tower-A', csnNumber: 'CSN1001', ownerFlatNumber: 'A-101', accessmode: 'IN',  inoutTime: dt(today,  8, 15), cardType: 'DResident'  },
//       { ownerName: 'Priya Mehta',    nrdName: 'NRD-Alpha', buildingName: 'Tower-A', csnNumber: 'CSN1002', ownerFlatNumber: 'A-102', accessmode: 'OUT', inoutTime: dt(today,  9, 30), cardType: 'PResident'  },
//       { ownerName: 'Ravi Joshi',     nrdName: 'NRD-Alpha', buildingName: 'Tower-B', csnNumber: 'CSN1003', ownerFlatNumber: 'B-201', accessmode: 'IN',  inoutTime: dt(today, 10, 45), cardType: 'DTenant'    },
//       { ownerName: 'Sneha Patil',    nrdName: 'NRD-Beta',  buildingName: 'Tower-C', csnNumber: 'CSN1004', ownerFlatNumber: 'C-301', accessmode: 'OUT', inoutTime: dt(today, 11, 0),  cardType: 'PTenant'    },
//       { ownerName: 'Kiran Desai',    nrdName: 'NRD-Beta',  buildingName: 'Tower-C', csnNumber: 'CSN1005', ownerFlatNumber: 'C-302', accessmode: 'IN',  inoutTime: dt(today, 13, 20), cardType: 'SProvider'  },

//       // ── YESTERDAY ──────────────────────────────────────────────
//       { ownerName: 'Rohan Kulkarni', nrdName: 'NRD-Beta',  buildingName: 'Tower-D', csnNumber: 'CSN1006', ownerFlatNumber: 'D-401', accessmode: 'IN',  inoutTime: dt(yesterday, 8, 0),  cardType: 'Employee'   },
//       { ownerName: 'Pooja Singh',    nrdName: 'NRD-Beta',  buildingName: 'Tower-D', csnNumber: 'CSN1007', ownerFlatNumber: 'D-402', accessmode: 'OUT', inoutTime: dt(yesterday, 9, 45), cardType: 'DLandOwner' },
//       { ownerName: 'Arjun Nair',     nrdName: 'NRD-Gamma', buildingName: 'Tower-E', csnNumber: 'CSN1008', ownerFlatNumber: 'E-501', accessmode: 'IN',  inoutTime: dt(yesterday, 14, 10), cardType: 'Guest'     },
//       { ownerName: 'Meena Iyer',     nrdName: 'NRD-Gamma', buildingName: 'Tower-E', csnNumber: 'CSN1009', ownerFlatNumber: 'E-502', accessmode: 'OUT', inoutTime: dt(yesterday, 15, 30), cardType: 'DResident' },
//       { ownerName: 'Suresh Verma',   nrdName: 'NRD-Alpha', buildingName: 'Tower-B', csnNumber: 'CSN1010', ownerFlatNumber: 'B-202', accessmode: 'IN',  inoutTime: dt(yesterday, 17, 0),  cardType: 'PTenant'   },

//       // ── DAY BEFORE YESTERDAY ───────────────────────────────────
//       { ownerName: 'Anita Rao',      nrdName: 'NRD-Alpha', buildingName: 'Tower-A', csnNumber: 'CSN1011', ownerFlatNumber: 'A-103', accessmode: 'OUT', inoutTime: dt(dayBefore, 8, 30),  cardType: 'PResident'  },
//       { ownerName: 'Vikram Shah',    nrdName: 'NRD-Beta',  buildingName: 'Tower-C', csnNumber: 'CSN1012', ownerFlatNumber: 'C-303', accessmode: 'IN',  inoutTime: dt(dayBefore, 11, 15), cardType: 'Employee'   },
//       { ownerName: 'Deepa Pillai',   nrdName: 'NRD-Gamma', buildingName: 'Tower-E', csnNumber: 'CSN1013', ownerFlatNumber: 'E-503', accessmode: 'IN',  inoutTime: dt(dayBefore, 12, 0),  cardType: 'SProvider'  },
//       { ownerName: 'Mohit Gupta',    nrdName: 'NRD-Beta',  buildingName: 'Tower-D', csnNumber: 'CSN1014', ownerFlatNumber: 'D-101', accessmode: 'OUT', inoutTime: dt(dayBefore, 16, 45), cardType: 'DLandOwner' },
//       { ownerName: 'Asha Reddy',     nrdName: 'NRD-Gamma', buildingName: 'Tower-E', csnNumber: 'CSN1015', ownerFlatNumber: 'E-101', accessmode: 'IN',  inoutTime: dt(dayBefore, 20, 0),  cardType: 'Guest'      },
//     ];

//     this.filteredData = [...this.inOutData];

//     // Populate dropdowns from dummy data
//     this.neighbourhoods = [...new Set(this.inOutData.map(d => d.nrdName))].map(n => ({ value: n, label: n }));
//     this.allBuildings   = this.inOutData.map(d => ({ value: d.buildingName, label: d.buildingName, nrdName: d.nrdName }))
//                             .filter((b, i, arr) => arr.findIndex(x => x.value === b.value) === i);
//     this.buildings      = [...this.allBuildings];
//   }

//   getDisplayValue(controlName: string, options: { value: string; label: string }[]): string {
//     const values: string[] = this.reportForm.get(controlName)?.value || [];
//     const individual = values.filter(v => v !== 'ALL');
//     if (individual.length === 0) return '';
//     return options.filter(o => individual.includes(o.value)).map(o => o.label).join(', ');
//   }

//   onCardTypeChange(event: any) {
//     const selected: string[] = event.value;
//     const allValues = this.cardTypes.map(c => c.value);
//     const allWasPrev = this.prevCardType.includes('ALL');
//     const allIsNow   = selected.includes('ALL');
//     let newValue: string[];

//     if      (!allWasPrev && allIsNow)  newValue = ['ALL', ...allValues];
//     else if (allWasPrev  && !allIsNow) newValue = [];
//     else if (allWasPrev  && allIsNow)  newValue = selected.filter(v => v !== 'ALL');
//     else {
//       newValue = selected.filter(v => v !== 'ALL');
//       if (allValues.every(v => newValue.includes(v))) newValue = ['ALL', ...allValues];
//     }

//     this.prevCardType = newValue;
//     this.reportForm.get('cardType')?.setValue(newValue, { emitEvent: false });
//   }

//   onAccessModeChange(event: any) {
//     const selected: string[] = event.value;
//     const allValues = this.accessModes.map(a => a.value);
//     const allWasPrev = this.prevAccessMode.includes('ALL');
//     const allIsNow   = selected.includes('ALL');
//     let newValue: string[];

//     if      (!allWasPrev && allIsNow)  newValue = ['ALL', ...allValues];
//     else if (allWasPrev  && !allIsNow) newValue = [];
//     else if (allWasPrev  && allIsNow)  newValue = selected.filter(v => v !== 'ALL');
//     else {
//       newValue = selected.filter(v => v !== 'ALL');
//       if (allValues.every(v => newValue.includes(v))) newValue = ['ALL', ...allValues];
//     }

//     this.prevAccessMode = newValue;
//     this.reportForm.get('accessMode')?.setValue(newValue, { emitEvent: false });
//   }

//   onNeighbourhoodChange(event: any) {
//     const selected: string[] = event.value;
//     const allValues = this.neighbourhoods.map(n => n.value);
//     const allWasPrev = this.prevNeighbourhood.includes('ALL');
//     const allIsNow   = selected.includes('ALL');
//     let newValue: string[];

//     if      (!allWasPrev && allIsNow)  { newValue = ['ALL', ...allValues]; this.buildings = [...this.allBuildings]; }
//     else if (allWasPrev  && !allIsNow)   newValue = [];
//     else if (allWasPrev  && allIsNow)    newValue = selected.filter(v => v !== 'ALL');
//     else {
//       newValue = selected.filter(v => v !== 'ALL');
//       if (allValues.every(v => newValue.includes(v))) newValue = ['ALL', ...allValues];
//     }

//     this.prevNeighbourhood = newValue;
//     this.reportForm.get('neighbourhood')?.setValue(newValue, { emitEvent: false });
//   }

//   onBuildingChange(event: any) {
//     const selected: string[] = event.value;
//     const allValues = this.buildings.map(b => b.value);
//     const allWasPrev = this.prevBuildingName.includes('ALL');
//     const allIsNow   = selected.includes('ALL');
//     let newValue: string[];

//     if      (!allWasPrev && allIsNow)  newValue = ['ALL', ...allValues];
//     else if (allWasPrev  && !allIsNow) newValue = [];
//     else if (allWasPrev  && allIsNow)  newValue = selected.filter(v => v !== 'ALL');
//     else {
//       newValue = selected.filter(v => v !== 'ALL');
//       if (allValues.every(v => newValue.includes(v))) newValue = ['ALL', ...allValues];
//     }

//     this.prevBuildingName = newValue;
//     this.reportForm.get('buildingName')?.setValue(newValue, { emitEvent: false });
//   }

//   // NOTE: loadNRDList and loadBuildingList are commented out while using dummy data.
//   // Uncomment and remove the dummy loadData() above when switching back to real API.
//   loadNRDList()     { /* this.http.get<any[]>(`${environment.apiurl}nrd`).subscribe(...) */ }
//   loadBuildingList(){ /* this.http.get<any[]>(`${environment.apiurl}Building`).subscribe(...) */ }

//   stripTime(d: Date): Date {
//     return new Date(d.getFullYear(), d.getMonth(), d.getDate());
//   }

//   applyFilters() {
//     const f = this.reportForm.value;
//     if (f.searchValue?.trim() && !f.searchType) {
//       alert('Please select a search type');
//       return;
//     }

//     let data = Array.isArray(this.inOutData) ? [...this.inOutData] : [];

//     if (f.accessMode && f.accessMode.length) {
//       const allowed = f.accessMode.includes('ALL')
//         ? this.accessModes.map(a => a.value.toLowerCase())
//         : f.accessMode.map((m: string) => m.toLowerCase());
//       data = data.filter(x => allowed.includes(x.accessmode?.toLowerCase()));
//     }

//     if (f.cardType && f.cardType.length) {
//       const allowed = f.cardType.includes('ALL')
//         ? Object.values(this.cardTypeMap).flat()
//         : f.cardType.flatMap((t: string) => this.cardTypeMap[t] || []);
//       data = data.filter(x => allowed.includes(x.cardType));
//     }

//     if (f.neighbourhood && f.neighbourhood.length) {
//       const nrdFilter = f.neighbourhood.includes('ALL')
//         ? Array.from(new Set(data.map(d => d.nrdName).filter(Boolean)))
//         : f.neighbourhood;
//       data = data.filter(x => nrdFilter.includes(x.nrdName));
//     }

//     if (f.buildingName && f.buildingName.length) {
//       const bFilter = f.buildingName.includes('ALL')
//         ? Array.from(new Set(data.map(d => d.buildingName).filter(Boolean)))
//         : f.buildingName;
//       data = data.filter(x => bFilter.includes(x.buildingName));
//     }

//     if (f.fromDate) {
//       const from = new Date(f.fromDate);
//       f.fromTime ? (() => { const [h,m] = f.fromTime.split(':').map(Number); from.setHours(h,m,0,0); })()
//                  : from.setHours(0,0,0,0);
//       data = data.filter(x => x.inoutTime && new Date(x.inoutTime) >= from);
//     }

//     if (f.toDate) {
//       const to = new Date(f.toDate);
//       f.toTime ? (() => { const [h,m] = f.toTime.split(':').map(Number); to.setHours(h,m,59,999); })()
//                : to.setHours(23,59,59,999);
//       data = data.filter(x => x.inoutTime && new Date(x.inoutTime) <= to);
//     }

//     // if (f.searchType && f.searchValue?.trim()) {
//     //   const txt = f.searchValue.toLowerCase();
//     //   data = data.filter(item => item[f.searchType]?.toString().toLowerCase().includes(txt));
//     // }

//     if (f.searchType && f.searchValue?.trim()) {
//   const txt = f.searchValue.toString().trim().toLowerCase();

//   data = data.filter(item => {
//     const value = item[f.searchType]?.toString().toLowerCase() || '';

//     // Create safe regex (escape special chars)
//     const escapedTxt = txt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

//     // Regex: match word boundary OR non-alphanumeric boundary
//     const regex = new RegExp(`(^|[^a-z0-9])${escapedTxt}($|[^a-z0-9])`);

//     return regex.test(value);
//   });
// }

//     data = sortByTimeOnly(data, 'inoutTime', 'asc');
//     this.filteredData = data;

//     if (this.paginator) { this.paginator.length = this.filteredData.length; this.paginator.pageIndex = 0; }
//     this.updatePagedData();
//   }

//   showReports() { this.applyFilters(); }

//   Clear() {
//     this.reportForm.reset({ accessMode: '', fromDate: '', toDate: '', cardType: [], neighbourhood: [], buildingName: [], searchType: '', searchValue: '' }, { emitEvent: false });
//     this.prevCardType = []; this.prevAccessMode = []; this.prevNeighbourhood = []; this.prevBuildingName = [];
//     if (this.paginator) this.paginator.firstPage();
//   }

//   exportPDF() {
//     if (!this.filteredData.length) return;
//     const generated = new Date().toLocaleString();
//     const doc = new jsPDF('l', 'mm', 'a4');
//     const logo = new Image(); logo.src = 'assets/images/logo/logo.jpeg';
//     logo.onload = () => {
//       const pw = doc.internal.pageSize.getWidth(), ph = doc.internal.pageSize.getHeight();
//       doc.addImage(logo, 'JPEG', 10, 10, 15, 15);
//       doc.setFontSize(18); doc.setFont(undefined, 'bold');
//       doc.text('IN-OUT REPORT', pw / 2, 20, { align: 'center' });
//       const dates = this.filteredData.map(r => r.inoutTime ? new Date(r.inoutTime) : null).filter(d => d);
//       if (dates.length) {
//         const min = new Date(Math.min(...dates.map(d => d!.getTime())));
//         const max = new Date(Math.max(...dates.map(d => d!.getTime())));
//         doc.setFontSize(11); doc.setFont(undefined, 'normal');
//         doc.text(`From: ${min.toLocaleDateString()} to ${max.toLocaleDateString()}`, pw / 2, 28, { align: 'center' });
//       }
//       doc.setFontSize(10); doc.text(`Printed On: ${generated}`, pw - 10, 20, { align: 'right' });
//       autoTable(doc, {
//         startY: 35,
//         head: [['Sr No','Name','Neighbourhood','Building','CSN','Access Mode','AccessTime','Card Type']],
//         body: this.filteredData.map((r,i) => [i+1, r.ownerName||'N/A', r.nrdName||'N/A', r.buildingName||'N/A', r.csnNumber||'N/A', r.accessmode||'N/A', r.inoutTime ? new Date(r.inoutTime).toLocaleString() : 'N/A', r.cardType||'N/A']),
//         theme: 'grid',
//         headStyles: { fillColor: [220,220,220], textColor: 20, fontStyle: 'bold' },
//         bodyStyles: { fontSize: 9, textColor: [0,0,0], fontStyle: 'normal' },
//         didDrawPage: (data) => { doc.setFontSize(10); doc.text(`Page ${data.pageNumber}`, pw/2, ph-10, {align:'center'}); doc.text('©IDS ID SMART TECH', 10, ph-10); }
//       });
//       doc.save('InOutReport.pdf');
//     };
//   }

//   exportExcel() {
//     if (!this.filteredData.length) return;
//     const printedDate = new Date().toLocaleString();
//     const excelData = this.filteredData.map((r,i) => ({ 'Sr No': i+1, 'Name': r.ownerName||'', 'Neighbourhood': r.nrdName||'', 'Building': r.buildingName||'', 'CSN': r.csnNumber||'', 'Access Mode': r.accessmode||'', 'AccessTime': r.inoutTime ? DateTimeUtil.formatDateTime(r.inoutTime) : '', 'Card Type': r.cardType||'' }));
//     const wb = XLSX.utils.book_new();
//     const wsData: any[][] = [["IN-OUT REPORT","","","","","","","",`Printed: ${printedDate}`],[],Object.keys(excelData[0])];
//     excelData.forEach(row => wsData.push(Object.values(row)));
//     const ws = XLSX.utils.aoa_to_sheet(wsData);
//     ws["A1"].s = { font: { bold: true, sz: 20 }, alignment: { horizontal: "center" } };
//     const tc = Object.keys(excelData[0]).length;
//     ws["!merges"] = [{ s:{r:0,c:0}, e:{r:0,c:tc-2} }];
//     ws[XLSX.utils.encode_cell({r:0,c:tc-1})].s = { font:{bold:true,sz:12}, alignment:{horizontal:"right"} };
//     Object.keys(excelData[0]).forEach((h,idx) => {
//       const cell = XLSX.utils.encode_cell({r:2,c:idx});
//       ws[cell].s = { font:{bold:true,sz:12}, alignment:{horizontal:"center"}, fill:{fgColor:{rgb:"DDEBF7"}}, border:{top:{style:"thin",color:{rgb:"000000"}},bottom:{style:"thin",color:{rgb:"000000"}},left:{style:"thin",color:{rgb:"000000"}},right:{style:"thin",color:{rgb:"000000"}}} };
//     });
//     ws["!cols"] = Object.keys(excelData[0]).map(h => ({ wch: h.length + 15 }));
//     XLSX.utils.book_append_sheet(wb, ws, "InOutReport");
//     saveAs(new Blob([XLSX.write(wb, { bookType:"xlsx", type:"array" })]), "InOutReport.xlsx");
//   }
// }
