// import { Component, inject } from '@angular/core';
// import { MatExpansionModule } from '@angular/material/expansion';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatInputModule } from '@angular/material/input';
// import { MatSelectModule } from '@angular/material/select';
// import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MatAutocompleteModule } from '@angular/material/autocomplete';
// import { MatTableModule } from '@angular/material/table'; // <-- Add MatTableModule
// import { CommonModule } from '@angular/common';
// import { MaterialModule } from 'src/app/_core/shared/material/material.module';
// import { MatDatepickerModule } from '@angular/material/datepicker';
// import { MatDialog } from '@angular/material/dialog';
// import { Router } from '@angular/router';
// import { RouterModule } from '@angular/router';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatMenuModule } from '@angular/material/menu';
// import { MatButtonModule } from '@angular/material/button';
// import { MatIconModule } from '@angular/material/icon';


// // ✅ Define ELEMENT_DATA (array of objects)
// const ELEMENT_DATA = [
//   { column1: 'John Doe', column2: 'Manager' },
//   { column1: 'Jane Smith', column2: 'Developer' },
// ];

// @Component({
//   selector: 'app-master',
//   standalone: true,
//   imports: [
//     CommonModule,
//     ReactiveFormsModule,
//     MaterialModule,
//     FormsModule,
//     RouterModule,
//     MatToolbarModule,
//     MatMenuModule// <-- Import MatTableModule here!
//   ],
//   templateUrl: './master.component.html',
//   styleUrl: './master.component.scss',
// })
// export class MasterComponent {
 

//   goToProfile() {
//     this.router.navigate(['master/profile']);
//   }

//   contractorForm: FormGroup;
//   constructor(private router: Router, private fb: FormBuilder) {
//     this.contractorForm = this.fb.group({
//       name: [''],
//       contactPerson: [''],
//       mobileNumber: [''],
//       validFrom: [''],
//       validUpTo: [''],
//       registrationNumber: [''],
//       address: [''],
//       landLine: [''],
//       email: ['']
//     });
//   }
//   // ✅ Assign ELEMENT_DATA
//   dataSource = ELEMENT_DATA;
//   displayedColumns: string[] = ['SrNo', 'Uname', 'Pname', 'actions'];
//   dataToDisplay: any[] = [];

//   city = { cityType: '' };
//   cityTypes: string[] = ['Riverview City', 'Option1', 'Option2'];
  
//   neighbourhood = { neighbourhoodType: '' };
//   neighbourhoodTypes: string[] = ['neighbourhood', 'One', 'Two', 'Three'];
  
//   reader ={ readerType: ''};
//   readerTypes: string[] = ['One', 'Two', 'Three'];

  
//   addAccessRights = {
//     searchBy: '',
//     neighbourhood: ''
//   };

//   onSearch() {
//     console.log('Search By:', this.addAccessRights.searchBy);
//     // Add your search logic here
//   }
//   onShowAll() {
//     console.log('Show All clicked');
//   }

//   // onAddNew() {
//   //   console.log('Add New clicked');
//   // }

  

  

//   removeData(element: any) {
//     console.log('Remove clicked for:', element);
//     // Remove element from dataToDisplay
//     this.dataToDisplay = this.dataToDisplay.filter(item => item !== element);
//   }

//   neighbourhoodOptions = ['Option 1', 'Option 2', 'Option 3']; // Example options
// }


import { ChangeDetectorRef, Component, OnInit   } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';


const ELEMENT_DATA = [
  { column1: 'John Doe', column2: 'Manager' },
  { column1: 'Jane Smith', column2: 'Developer' },
];

@Component({
  selector: 'app-master',
  standalone: true,
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss'],
  imports: [
    CommonModule,
    FormsModule,             // ✅ Required for [(ngModel)]
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule,
    MaterialModule,
    MatToolbarModule,
    MatMenuModule,
    MatCardModule
   

  ],
 
})
export class MasterComponent implements OnInit {
// Stats cards

    

  constructor(private router: Router, private fb: FormBuilder, private http: HttpClient, private cd: ChangeDetectorRef) {
    this.contractorForm = this.fb.group({
      name: [''],
      contactPerson: [''],
      mobileNumber: [''],
      validFrom: [''],
      validUpTo: [''],
      registrationNumber: [''],
      address: [''],
      landLine: [''],
      email: ['']
     
    });
    
  }

  goToProfile() {
    this.router.navigate(['master/profile']);
  }

  contractorForm: FormGroup;

  dataSource = ELEMENT_DATA;
  displayedColumns: string[] = ['SrNo', 'Uname', 'Pname', 'actions'];
  dataToDisplay: any[] = [];

  city = { cityType: '' };
  cityTypes: string[] = ['Riverview City', 'Option1', 'Option2'];

  neighbourhood = { neighbourhoodType: '' };
  neighbourhoodTypes: string[] = ['neighbourhood', 'One', 'Two', 'Three'];

  reader = { readerType: '' };
  readerTypes: string[] = ['One', 'Two', 'Three'];

  addAccessRights = {
    searchBy: '',
    neighbourhood: ''
  };

  onSearch() {
    console.log('Search By:', this.addAccessRights.searchBy);
  }

  onShowAll() {
    console.log('Show All clicked');
  }

  removeData(element: any) {
    console.log('Remove clicked for:', element);
    this.dataToDisplay = this.dataToDisplay.filter(item => item !== element);
  }

  neighbourhoodOptions = ['Option 1', 'Option 2', 'Option 3'];

  // ✅ Required for dropdown
  projectList: any[] = [];
  selectedProject: string = '';

  ngOnInit(): void {
    const companyId = localStorage.getItem('companyID');
   
    if (companyId && companyId !== 'null' && !isNaN(Number(companyId))) {
      this.http.get<any[]>(`http://192.168.0.9:5253/api/NRD/GetAllProjectNRDs/${companyId}`)
        .subscribe(response => {
          this.projectList = response;
          if (response.length > 0) {
            this.selectedProject = response[0].id;
          }
          this.cd.detectChanges()

        });
    }
  }
}
