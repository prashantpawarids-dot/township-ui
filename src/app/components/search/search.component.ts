import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from 'src/app/_core/shared/material/material.module';
import { AuthService } from 'src/app/services/auth.service';
import { AuthorityService } from 'src/app/services/authority.service';

import Swal from 'sweetalert2';
import { Observable } from 'rxjs';
import { Console } from 'console';

@Component({
  selector: 'app-search',
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule
  ],
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss'
})
export class SearchComponent {
  returnPath: string | null = null;
  searchByOptions: any[] = [{ name: "Name", key: "name" }, { name: "Code", key: "code" }];
  searchBy: {keyName: string; query:string} = {keyName: "", query: ""};
  dataToDisplay: any[] = [];
  dataSource = new MatTableDataSource<any>(this.dataToDisplay); // Use MatTableDataSource
  displayedColumns: string[] = [];
  @ViewChild('paginator') paginator: MatPaginator;

  pageSizes = [3, 5, 7];
  pageSize = 10;
   showDownloadBtn: boolean = false;
MODULE_KEY: number = -1;

get auth() {
  return this.authorityService;
}

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }
getModuleKeyForPath(path: string): number {
  if (!path) return 0;

  // remove query params
  const cleanPath = path.split('?')[0];

  const map: { [key: string]: number } = {
    // '/master/company': 1,
    // '/master/profile': 2,
    // '/master/project': 3,
    // '/master/user': 4,
    // '/master/river-view-city': 5,
    // '/master/neighbourhood': 6,
    // '/master/building': 7,
    // '/master/reader-location': 8,
    // '/master/service-provider': 9,
    // '/master/amenities': 10,
    // '/master/reader-relay': 11,
    //  '/land-owner': 12,
    // '/resident': 13,
    // '/employee': 14, 
    // '/card-lost-damage': 15,
    // '/tag-block-revoke': 16,
    // '/guest': 17,
    // '/visitor': 18

    // ===== MASTER =====
    '/master/company': 1,
    '/master/profile': 2,
    '/master/project': 3,
    '/master/user': 4,
     '/master/contrator-type': 5,
    '/master/neighbourhood': 6,
    '/master/building': 7,
    '/master/reader-location': 8,
    '/master/service-type': 9,
    '/master/amenities': 10,
    '/master/reader-relay': 11,
    '/land-owner': 12,
    '/resident': 13,
    '/employee': 14,
     '/card-lost-damage': 15,
    '/tag-block-revoke': 16,
     '/guest': 17,
    '/visitor': 18,
     '/service-provider': 19,
    '/contractor': 20,
    '/tenant': 21,
  };

  return map[cleanPath] ?? 0; // 0 = no authority
}

  constructor(private route: ActivatedRoute, private router: Router,private authorityService: AuthorityService ,
    private authService: AuthService) {
    this.route.queryParamMap.subscribe(params => {
      this.returnPath = params.get('returnPath');
      this.showDownloadBtn = this.returnPath?.startsWith('/master/') || false; // ✅ Show PDF only for master
      this.MODULE_KEY = this.getModuleKeyForPath(this.returnPath || '');
// console.log('MODULE_KEY in Search Component:', this.MODULE_KEY);

// this.route.queryParamMap.subscribe(params => {
//   this.returnPath = params.get('returnPath');
//   this.showDownloadBtn = this.returnPath?.startsWith('/master/') || false;
//   this.MODULE_KEY = this.getModuleKeyForPath(this.returnPath || '');
  // console.log('📍 Current returnPath:', this.returnPath);
  // console.log('🔑 MODULE_KEY:', this.MODULE_KEY);
  
  // Add this debugging right after MODULE_KEY is set:
  // console.log('🔍 Checking permissions for MODULE_KEY:', this.MODULE_KEY);
  // console.log('  - canView:', this.authorityService.canView(this.MODULE_KEY));
  // console.log('  - canInsert:', this.authorityService.canInsert(this.MODULE_KEY));
  // console.log('  - canUpdate:', this.authorityService.canUpdate(this.MODULE_KEY));
  // console.log('  - canDelete:', this.authorityService.canDelete(this.MODULE_KEY));
  // console.log('  - canBlock:', this.authorityService.canBlock(this.MODULE_KEY));

      switch (this.returnPath) {
        case '/land-owner':
          this.resetFields();
          this.setLandOwner();
          break;
        case '/resident':
          this.resetFields();
          this.setResident();
          break;
        case '/tenant':
          this.resetFields();
          this.setTenant();
          break;
        case '/guest':
          this.resetFields();
          this.setGuest();
          break;
        case '/visitor':
          this.resetFields();
          this.setVisitor();
          break;
        case '/service-provider':
          this.resetFields();
          this.setServiceProvider();
          break;
        case '/employee':
          this.resetFields();
          this.setEmployee();
          break;
        case '/master/profile':
          this.resetFields();
          this.setProfile();
          break;
        case '/master/user':
          this.resetFields();
          this.setUser();
          break;
        case '/master/river-view-city':
          this.resetFields();
          this.setRiverViewCity();
          break;
        case '/master/neighbourhood':
          this.resetFields();
          this.setNeighbourhood();
          break;
        case '/master/building':
          this.resetFields();
          this.setBuilding();
          break;
        case '/master/reader-location':
          this.resetFields();
          this.setReaderLocation();
          break;
        case '/master/service-type':
          this.resetFields();
          this.setServiceType();
          break;
          case '/master/contrator-type':
  this.resetFields();
  this.setContractorType();
  break;
          case '/master/amenities':
            this.resetFields();
            this.setAmenities();
            break;
          case '/master/reader-relay':
            this.resetFields();
            this.setReaderRelay();
            break;
            case '/contractor':
          this.resetFields();
          this.setContractor();
          break;
        case '/master/company':
          this.resetFields();
          this.setCompany();
          break;
        case '/master/project':
          this.resetFields();
          this.setProject();
          break;
        default:
          break;
      }
    });
  }

  title: string;



  searchData() {
    if (!this.searchBy.query) {
      this.dataSource.data = this.dataToDisplay;
    } else if(this.searchBy.keyName) {
      this.dataSource.data = this.dataToDisplay.filter((element: any) => {
        if (this.searchBy.keyName === "fullname") {
          let name = [element["firstName"], element["middleName"], element["lastName"]].join(" ");
          return name.toLowerCase().includes(this.searchBy.query.toLowerCase())
        } else if (this.searchBy.keyName === "isResident") {
          return this.searchBy.query.toLowerCase() == 'yes' ? element.isResident : !element.isResident
            
        } else if (element[this.searchBy.keyName]) {
          return element[this.searchBy.keyName].toLowerCase().includes(this.searchBy.query.toLowerCase());
        }
        return false
      })
    }
  }

  displaSearchBy = (option: any): string => {
    console.log(option)
    const match = this.searchByOptions?.find(opt => opt.key == option)
    return match && match.name ? match.name : '';
  }

  resetFields() {
    this.searchBy =  {keyName: "", query: ""};
    this.dataToDisplay = [];
    this.dataSource.data = this.dataToDisplay; // Update dataSource data
    this.displayedColumns = [];
  }

  setLandOwner() {
    this.title = 'Land Owner';
    this.searchByOptions = [{ name: "Id Number", key: "idNumber" }, { name: "Name", key: "fullname" }, { name: "Neighbourhood", key: "nrdName" }, { name: "Building", key: "buildingName" }, { name: "Flat no.", key: "flatNumber" }];
    this.authService.getLandOwner().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = this.dataToDisplay; // Update dataSource data
      this.displayedColumns = ['srno', 'idNumber', 'fullname', 'nrdName' , 'buildingName', 'flatNumber', 'actions']
    });
  }

  setResident() {
    this.title = 'Resident';
    this.searchByOptions = [{ name: "Id Number", key: "idNumber" }, { name: "Name", key: "fullname" }, { name: "Neighbourhood", key: "nrdName" }, { name: "Building", key: "buildingName" }, { name: "Flat no.", key: "flatNumber" }];
    this.authService.getResident().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = this.dataToDisplay; // Update dataSource data
      this.displayedColumns = ['srno', 'idNumber', 'fullname', 'nrdName' , 'buildingName', 'flatNumber', 'actions']
    });
  }
  
  setTenant() {
    this.title = 'Tenant';
    this.searchByOptions = [{ name: "Id Number", key: "idNumber" }, { name: "Name", key: "fullname" }, { name: "Neighbourhood", key: "nrdName" }, { name: "Building", key: "buildingName" }, { name: "Flat no.", key: "flatNumber" }];
    this.authService.getTenant().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = this.dataToDisplay; // Update dataSource data
      this.displayedColumns = ['srno', 'idNumber', 'fullname', 'nrdName' , 'buildingName', 'flatNumber', 'actions']
    });
  }

  setServiceProvider() {
    this.title = 'Service Provider';
    this.searchByOptions = [{ name: "Id Number", key: "idNumber" },{ name: "Name", key: "fullname" }, { name: "Service Type", key: "serviceType" }];
    this.authService.getServiceProvider().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = this.dataToDisplay; // Update dataSource data
      this.displayedColumns = ['srno', 'idNumber', 'fullname', 'serviceType', 'mobileNo', 'actions']
    });
  }

  setEmployee(){
    this.title = 'Employee';
    this.searchByOptions = [{ name: "Id Number", key: "idNumber" }, { name: "Name", key: "fullname" }, { name: "Is Resident", key: "isResident" }];
    this.authService.getEmployee().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = this.dataToDisplay;
      this.displayedColumns = ['srno', 'idNumber', 'fullname', 'role', 'mobileNo', 'Is Resident','actions']
    });
  }

  setCompany(){
    this.title = 'Company';
    this.searchByOptions = [{ name: "Id", key: "id" }, { name: "Company Name", key: "companyName" }, { name: "Company Code", key: "comanyCode" }];
    this.authService.getCompany().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = this.dataToDisplay;
      this.displayedColumns = ['srno', 'Id', 'comanyCode', 'companyName', 'address', 'actions']
    });
  }

  setProject(){
    this.title = 'Project';
    this.searchByOptions = [{ name: "Project Name", key: "projectName" }, { name: "Project Code", key: "projectCode" }];
    this.authService.getProject().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = this.dataToDisplay;
      this.displayedColumns = ['srno', 'Id', 'projectCode', 'projectName', 'actions']
    });
  }

  setGuest(){
    this.title = 'Guest';
    this.searchByOptions = [{ name: "Id Number", key: "idNumber" }, { name: "Name", key: "fullname" }, { name: "Neighbourhood", key: "nrdName" }, { name: "Building", key: "buildingName" }, { name: "Flat no.", key: "flatNumber" }];
    this.authService.getGuest().subscribe(res =>{
      this.dataToDisplay = [...res];
      this.dataSource.data = this.dataToDisplay;
      this.displayedColumns = ['srno', 'idNumber', 'fullname', 'nrdName', 'buildingName', 'flatNumber','actions']
    });
  }

  setVisitor(){
    this.title = 'Visitor';
    this.searchByOptions = [{ name: "Id Number", key: "idNumber" }, { name: "Name", key: "fullname" }, { name: "Neighbourhood", key: "nrdName" }, { name: "Building", key: "buildingName" }, { name: "Flat no.", key: "flatNumber" }];
    this.authService.getVisitor().subscribe(res =>{
      this.dataToDisplay = [...res];
      this.dataSource.data = this.dataToDisplay;
      this.displayedColumns = ['srno', 'idNumber', 'fullname', 'nrdName', 'buildingName', 'flatNumber','actions']
    });
  }
  
  // setProfile() {
  //   this.title = 'Profile';
  //   this.authService.getProfile().subscribe(res => {
  //     this.dataToDisplay = [...res];
  //     this.dataSource.data = (this.dataToDisplay);
  //     this.searchByOptions = [{ name: "User Id", key: "uid" }, { name: "Profile Name", key: "profileName" }];
  //     this.displayedColumns = ['srno', 'profileName', 'actions']
  //   });
  // }


 setProfile() {
  this.title = 'Profile';
  this.authService.getProfileRegister().subscribe(res => {
    this.dataToDisplay = [...res];            
    this.dataSource.data = this.dataToDisplay; 

    this.searchByOptions = [
      // { name: "Profile ID", key: "profileID" },
      {name:"User ID",key:"uid"},   // Changed from uid
      { name: "Profile Name", key: "profileName" },
      { name: "User", key: "user" }               
    ];

    // Add profileID to columns and update view/edit to use correct ID
    this.displayedColumns = ['srno', 'uid', 'profileName', 'user', 'actions'];
  });
}


  setUser() {
    this.title = 'User';
    this.searchByOptions = [{ name: "User Id", key: "uid" }, { name: "Email", key: "email" }];
    this.authService.getUser().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = (this.dataToDisplay);
      this.displayedColumns = ['srno', 'Name', 'uid', 'Email','Phone', 'actions']
    });
  }

  setRiverViewCity() {
    this.title = 'RiverView City';
    this.authService.getRiverViewCity().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = (this.dataToDisplay);
      this.displayedColumns = ['srno', 'fullname', 'actions']
    });
  }

  setNeighbourhood() {
    this.title = 'Neighbourhood';
   this.searchByOptions = [{ name: "Id", key: "id" }, { name: "Company Name", key: "name" }, { name: "Neighbourhood", key: "code" }];

    this.authService.getNeighbourhood().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = (this.dataToDisplay);
      this.displayedColumns = ['srno', 'Id',  'Name','short name', 'actions']
    });
  }

  // setBuilding() {
  //   this.title = 'Building';
  //   this.searchByOptions = [{ name: "Id", key: "id" }, { name: "Name", key: "name" }, { name: "Short Name", key: "code" }];
  //   this.authService.getBuildings().subscribe(res => {
  //     this.dataToDisplay = [...res];
  //     this.dataSource.data = (this.dataToDisplay);
  //     this.displayedColumns = ['srno', 'Id', 'short name', 'Name', 'actions']
  //   });
  // }



  setBuilding() {
  this.title = 'Building';
  this.searchByOptions = [
    { name: "Id", key: "id" },
    { name: "Name", key: "name" },
    { name: "Short Name", key: "code" }
  ];

  this.authService.getBuildings().subscribe(res => {

    // 🔥 Sort by ID ascending
    const sorted = res.sort((a, b) => a.id - b.id);

    this.dataToDisplay = [...sorted];
    this.dataSource.data = this.dataToDisplay;

    this.displayedColumns = ['srno', 'Id', 'short name', 'Name', 'actions'];
  });
}


  setReaderLocation() {
    this.title = 'Reader Location';
    this.authService.getReaderLocation().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = (this.dataToDisplay);
      this.displayedColumns = ['srno', 'Name','actions']
    });
  }

  setServiceType() {
    this.title = 'Service Type';
    this.authService.getServiceType().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = (this.dataToDisplay);
      this.displayedColumns = ['srno', 'Id', 'service type', 'actions']
    });
  }

setContractorType() {
  this.title = 'Contractor Type';

  this.authService.getContractorType().subscribe(res => {
    this.dataToDisplay = [...res];
    this.dataSource.data = this.dataToDisplay;

    
    this.displayedColumns = ['srno', 'Id', 'contractor type', 'actions'];
  });
}


  setContractor() {
    this.title = 'Contractor';
    this.searchByOptions = [{ name: "Id", key: "id" }, { name: "Name", key: "fullname" }, { name: "Contactor Type", key: "contractorTypeName" }];
    this.authService.getContractor().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = (this.dataToDisplay);
      this.displayedColumns = ['srno', "Id", 'fullname', 'contactorType', 'actions']
    });
  }

  setAmenities() {
    this.title = 'Amenities';
    this.searchByOptions = [{ name: "Id", key: "id" }, { name: "Name", key: "name" }, { name: "Short Name", key: "code" }];
    this.authService.getAmenities().subscribe(res => {
      this.dataToDisplay = [...res];
      this.dataSource.data = (this.dataToDisplay);
      this.displayedColumns = ['srno', 'Id', 'short name', 'Name', 'actions'];
    });
  }

  // setReaderRelay() {
  //   this.title = 'Reader Relay';
  //   this.authService.getReaderRelay().subscribe(res => {
  //     this.dataToDisplay = [...res];
  //     this.dataSource.data = (this.dataToDisplay);
  //     this.displayedColumns = ['srno', 'fullname', 'actions']
  //   });
  // }

setReaderRelay() {
  this.title = 'Reader Relay';
  
  this.authService.getReader().subscribe(res => {
    this.dataToDisplay = [...res];
    this.dataSource.data = this.dataToDisplay;

    // Only show srno, readerLocation, actions
    this.displayedColumns = ['srno', 'readerLocation', 'actions'];
  });
}


  // viewData(data: any) {
  //   if (this.returnPath) {
  //     this.navigateBack(data.id, true);
  //   }
  // }

viewData(data: any) {
  if (this.returnPath) {
    // Use uid for profile route (unique), otherwise use id
    const idToPass = this.returnPath === '/master/profile' ? data.uid : data.id;
    this.navigateBack(idToPass, true);
  }
}

  viewResident(data) {
    this.navigateBack(data);
  }

  viewTenant(data) {
    this.navigateBack(data);
  }

  editData(data: any) {
    switch (this.returnPath) {
       case '/master/profile':
      this.navigateBack(data.uid);
      break;
      case '/land-owner':
        this.viewLandOwner(data.id);
        break;
      case '/resident':
        this.viewResident(data.id)
        break;
      case '/tenant':
        this.viewResident(data.id)
        break;
      case '/service-provider':
        this.viewTenant(data.id);
        break;
      case '/master/neighbourhood':
        this.viewTenant(data.id);
        break;
      case '/master/building':
        this.viewTenant(data.id);
        break;
      case '/master/user':
        this.viewTenant(data.id);
        break;
      default:
        this.viewTenant(data.id);
        break;
    }

  }

  viewLandOwner(data: any) {
    // this.authService.setLandOwnerData(data, true); // Send data using a BehaviorSubject
    this.navigateBack(data);
  }

  editLandOwner(data: any) {
    // this.authService.setLandOwnerData(data, false);
    this.navigateBack(data);

  }

// deleteData(element: any) {
//   // Check if already deleted
//   if (element.logicalDeleted === 1 || element.isactive === false || element.isDeleted === true) {
//   this.showSwal('error', `This ${this.title} is already deleted`);
//   return;
// }

//    const deleteMethods: { [key: string]: (id: any) => Observable<any> } = {
//     '/tenant': this.authService.deleteTenant.bind(this.authService),
//     '/contractor': this.authService.deleteContractor.bind(this.authService),

//     '/master/amenities': this.authService.deleteAmenities.bind(this.authService),
//     '/master/building': this.authService.deleteBuilding.bind(this.authService),
//     '/master/company': this.authService.deleteCompany.bind(this.authService),
//     '/master/project': this.authService.deleteProject.bind(this.authService),
//     '/master/neighbourhood': this.authService.deleteNeighbourhood.bind(this.authService),
//     '/master/service-type': this.authService.deleteServiceType.bind(this.authService),
//     '/master/reader-location': this.authService.deleteReaderLocation.bind(this.authService),
//     '/master/reader-relay': this.authService.deleteReaderRelay.bind(this.authService),
//     '/master/profile': this.authService.deleteProfile.bind(this.authService),
//     '/master/user': this.authService.deleteUser.bind(this.authService),

//     '/land-owner': this.authService.deleteLandOwner.bind(this.authService),
//     '/resident': this.authService.deleteResident.bind(this.authService),
//     '/guest': this.authService.deleteGuest.bind(this.authService),
//     '/visitor': this.authService.deleteVisitor.bind(this.authService),
//     '/service-provider': this.authService.deleteServiceProvider.bind(this.authService),
//     '/employee': this.authService.deleteEmployee.bind(this.authService),
//   };

//   const deleteFn = deleteMethods[this.returnPath];

//   if (!deleteFn) {
//     this.showSwal('error', `Delete not implemented for this page`);
//     return;
//   }

//   // Call the delete function
//   deleteFn(element.id).subscribe({
//     next: () => {
//       this.showSwal('success', `${this.title} deleted successfully`);
//       element.logicalDeleted = 1;
//       this.dataSource.data = [...this.dataToDisplay];
//     },
//     error: () => {
//       this.showSwal('error', `Failed to delete ${this.title}`);
//     }
//   });
// }


deleteData(element: any) {
  // Check if already deleted
  if (element.logicalDeleted === 1 || element.isactive === false || element.isDeleted === true) {
    this.showSwal('error', `This ${this.title} is already deleted`);
    return;
  }

  const deleteMethods: { [key: string]: (id: any) => Observable<any> } = {
    '/tenant': this.authService.deleteTenant.bind(this.authService),
    '/contractor': this.authService.deleteContractor.bind(this.authService),
    '/master/amenities': this.authService.deleteAmenities.bind(this.authService),
    '/master/building': this.authService.deleteBuilding.bind(this.authService),
    '/master/company': this.authService.deleteCompany.bind(this.authService),
    '/master/project': this.authService.deleteProject.bind(this.authService),
    '/master/neighbourhood': this.authService.deleteNeighbourhood.bind(this.authService),
    '/master/service-type': this.authService.deleteServiceType.bind(this.authService),
     '/master/contrator-type': this.authService.deleteContractorType.bind(this.authService),
    '/master/reader-location': this.authService.deleteReaderLocation.bind(this.authService),
    '/master/reader-relay': this.authService.deleteReaderRelay.bind(this.authService),
    '/master/profile': this.authService.deleteProfile.bind(this.authService),
    '/master/user': this.authService.deleteUser.bind(this.authService),
    '/land-owner': this.authService.deleteLandOwner.bind(this.authService),
    '/resident': this.authService.deleteResident.bind(this.authService),
    '/guest': this.authService.deleteGuest.bind(this.authService),
    '/visitor': this.authService.deleteVisitor.bind(this.authService),
    '/service-provider': this.authService.deleteServiceProvider.bind(this.authService),
    '/employee': this.authService.deleteEmployee.bind(this.authService),
  };

  const deleteFn = deleteMethods[this.returnPath];

  if (!deleteFn) {
    this.showSwal('error', `Delete not implemented for this page`);
    return;
  }

  // ✅ Use profileID for profile route, otherwise use id
  const idToDelete = this.returnPath === '/master/profile' ? element.uid : element.id;

  // Call the delete function
  deleteFn(idToDelete).subscribe({
    next: () => {
      this.showSwal('success', `${this.title} deleted successfully`);
      element.logicalDeleted = 1;
      this.dataSource.data = [...this.dataToDisplay];
    },
    error: () => {
      this.showSwal('error', `Failed to delete ${this.title}`);
    }
  });
}
// Helper function to show Swal notifications
private showSwal(icon: 'success' | 'error', title: string) {
  Swal.fire({
    icon,
    title,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    background: icon === 'success' ? '#d4edda' : '#f8d7da',
    iconColor: icon === 'success' ? '#28a745' : '#d33',
    position: 'center'
  });
}

/** ------------------- Block / Revoke ------------------- */
blockOrRevoke(element: any) {
  // Check current block status
  if (!element.isBlocked) {
    // BLOCK flow
    Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to block this ${this.title}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) this.openBlockDatePopup(element);
    });
  } else {
    // REVOKE flow
    Swal.fire({
      title: 'Revoke Access?',
      text: `Do you want to revoke access for this ${this.title}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(result => {
      if (result.isConfirmed) {
        this.callBlockRevokeApi(element, 'R');
      }
    });
  }
}

openBlockDatePopup(element: any) {
  Swal.fire({
    title: 'Select Block Duration',
    html: `
      <label>From Date</label>
      <input type="datetime-local" id="fromDate" class="swal2-input">
      <label>To Date</label>
      <input type="datetime-local" id="toDate" class="swal2-input">
    `,
    confirmButtonText: 'Block',
    showCancelButton: true,
    preConfirm: () => {
      const fromdate = (document.getElementById('fromDate') as HTMLInputElement)?.value;
      const todate = (document.getElementById('toDate') as HTMLInputElement)?.value;

      if (!fromdate || !todate) {
        Swal.showValidationMessage('Both dates are required');
        return false;
      }
      return { fromdate, todate };
    }
  }).then(result => {
    if (result.isConfirmed && result.value) {
      this.callBlockRevokeApi(
        element,
        'B',
        result.value.fromdate,
        result.value.todate
      );
    }
  });
}

callBlockRevokeApi(
  element: any,
  blockRevokeType: 'B' | 'R',
  fromdate?: string,
  todate?: string
) {
  const iDnumber = Number(element.idNumber);
  if (isNaN(iDnumber)) {
    Swal.fire({ icon: 'error', title: 'Invalid ID number' });
    return;
  }

  // Prepare payload for POST API
  const payload: any = {
    id: element.accessBlockId ?? 0, // 0 if new block
    iDnumber,
    blockRevokType: blockRevokeType
  };

  if (blockRevokeType === 'B') {
    if (!fromdate || !todate) {
      Swal.fire({ icon: 'error', title: 'Both dates are required' });
      return;
    }
    payload.fromdate = new Date(fromdate).toISOString();
    payload.todate = new Date(todate).toISOString();
  }

  // console.log('Sending payload to backend:', payload);

  // Call backend API
  this.authService.blockRevokeAccess(payload).subscribe({
    next: (res: any) => {
      Swal.fire({
        icon: 'success',
        title: blockRevokeType === 'B'
          ? `${this.title} blocked successfully`
          : `${this.title} access revoked successfully`,
        showConfirmButton: false,
        timer: 2000
      });

      // Update element status
      element.accessBlockId = res?.id || element.accessBlockId;
      element.isBlocked = blockRevokeType === 'B';
      element.accessBlockType = blockRevokeType; // keep it in sync
    },
    error: (err) => {
      console.error('API Error:', err);
      Swal.fire({ icon: 'error', title: 'Operation failed' });
    }
  });
}














  // navigateBack(id?: any, view: boolean = false) {
  //   if (this.returnPath) {
  //     const [path, queryString] = this.returnPath.split('?');
  //     const queryParams = new URLSearchParams(queryString || '');
  //     queryParams.set('skipGuard', 'true');
  //     if (id) {
  //       queryParams.set('id', id);
  //     }
  //     if (view) {
  //       queryParams.set('view', "true");
  //     }
  //     this.router.navigate([path], {
  //       queryParams: Object.fromEntries(queryParams.entries())
  //     });
  //   }
  // }

  navigateBack(id?: any, view: boolean = false) {
  if (this.returnPath) {
    const [path, queryString] = this.returnPath.split('?');
    const queryParams = new URLSearchParams(queryString || '');

    queryParams.set('skipGuard', 'true');
    if (id) {
      queryParams.set('id', id);
    }
    if (view) {
      queryParams.set('view', "true");
    }

    // Convert URLSearchParams to plain object without using entries()
    const paramsObj: { [key: string]: string } = {};
    queryParams.forEach((value, key) => {
      paramsObj[key] = value;
    });

    this.router.navigate([path], {
      queryParams: paramsObj
    });
  }
}




}
